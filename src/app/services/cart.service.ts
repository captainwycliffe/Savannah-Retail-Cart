import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cart = new BehaviorSubject<Cart>({ items: [] });
  private validDiscounts = new Map([
    ['SAVE10', { type: 'percentage', value: 10 }],
    ['SAVE5', { type: 'fixed', value: 5 }],
  ]);

  constructor(private _snackBar: MatSnackBar) {}

  addToCart(item: CartItem): void {
    const items = [...this.cart.value.items];

    const itemInCart = items.find((_item) => _item.id === item.id);
    if (itemInCart) {
      itemInCart.quantity += 1;
    } else {
      items.push(item);
    }

    this.cart.next({ items });
    this._snackBar.open('1 item added to cart.', 'Ok', { duration: 3000 });
  }

  clearCart(): void {
    this.cart.next({ items: [] });
    this._snackBar.open('Cart is cleared.', 'Ok', {
      duration: 3000,
    });
  }

  removeFromCart(item: CartItem, updateCart = true): CartItem[] {
    const filteredItems = this.cart.value.items.filter(
      (_item) => _item.id !== item.id
    );

    if (updateCart) {
      this.cart.next({ items: filteredItems });
      this._snackBar.open('1 item removed from cart.', 'Ok', {
        duration: 3000,
      });
    }

    return filteredItems;
  }

  removeQuantity(item: CartItem): void {
    let itemForRemoval!: CartItem;

    let filteredItems = this.cart.value.items.map((_item) => {
      if (_item.id === item.id) {
        _item.quantity--;
        if (_item.quantity === 0) {
          itemForRemoval = _item;
        }
      }

      return _item;
    });

    if (itemForRemoval) {
      filteredItems = this.removeFromCart(itemForRemoval, false);
    }

    this.cart.next({ items: filteredItems });
    this._snackBar.open('1 item removed from cart.', 'Ok', {
      duration: 3000,
    });
  }

  applyDiscountCode(code: string): boolean {
    const discount = this.validDiscounts.get(code.toUpperCase());
    
    if (!discount) {
      this._snackBar.open('Invalid discount code', 'Ok', { duration: 3000 });
      return false;
    }

    const currentCart = this.cart.value;
    currentCart.discountCode = code.toUpperCase();
    
    const subtotal = this.getSubtotal(currentCart.items);
    if (discount.type === 'percentage') {
      currentCart.discountAmount = (subtotal * discount.value) / 100;
    } else {
      currentCart.discountAmount = discount.value;
    }

    this.cart.next(currentCart);
    this._snackBar.open('Discount applied successfully!', 'Ok', { duration: 3000 });
    return true;
  }

  removeDiscount(): void {
    const currentCart = this.cart.value;
    delete currentCart.discountCode;
    delete currentCart.discountAmount;
    this.cart.next(currentCart);
  }

  getSubtotal(items: CartItem[]): number {
    return items
      .map((item) => item.price * item.quantity)
      .reduce((prev, current) => prev + current, 0);
  }

  getTotal(items: CartItem[]): number {
    const subtotal = this.getSubtotal(items);
    const discount = this.cart.value.discountAmount || 0;
    return Math.max(subtotal - discount, 0);
  }
};