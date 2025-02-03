import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { loadStripe } from "@stripe/stripe-js";
import { Cart, CartItem } from "src/app/models/cart.model";
import { CartService } from "src/app/services/cart.service";
import { FormControl } from '@angular/forms';

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
})
export class CartComponent implements OnInit {
  cart: Cart = {
    items: [
      {
        product: "https://via.placeholder.com/150",
        name: "snickers",
        price: 150,
        quantity: 1,
        id: 1,
      },
      {
        product: "https://via.placeholder.com/150",
        name: "snickers",
        price: 150,
        quantity: 1,
        id: 2,
      },
    ],
  };

  dataSource: Array<CartItem> = [];
  displayedColumns: Array<string> = [
    "product",
    "name",
    "price",
    "quantity",
    "total",
    "action",
  ];
  discountCode = new FormControl('');

  constructor(private cartService: CartService, private http: HttpClient) {}

  onApplyDiscount(): void {
    if (this.discountCode.value) {
      this.cartService.applyDiscountCode(this.discountCode.value);
    }
  }

  getSubtotal(): number {
    return this.cartService.getSubtotal(this.cart.items);
  }

  getDiscount(): number {
    return this.cart.discountAmount || 0;
  }

  ngOnInit(): void {
    this.cartService.cart.subscribe((_cart: Cart) => {
      this.cart = _cart;
      this.dataSource = _cart.items;
    });
  }

  getTotal(items: Array<CartItem>): number {
    return this.cartService.getTotal(items);
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }

  onRemoveFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }

  onAddQuantity(item: CartItem): void {
    this.cartService.addToCart(item);
  }

  onCheckout(): void {
    this.http
      .post("http://localhost:4242/checkout", {
        items: this.cart.items,
      })
      .subscribe(async (res: any) => {
        let stripe = await loadStripe("pk_test_51PDSb3P479q0zTaNBotHRgizYjFg6AMa2NufgKqj028bkOI8AIyIjFcGSEStADfKVYXj4R4uRvOwErk9jcpAE8qg00UBnRK740");
        stripe?.redirectToCheckout({
          sessionId: res.id,
        });
      });
  }

  onRemoveQuantity(item: CartItem): void {
    this.cartService.removeQuantity(item);
  }
}
