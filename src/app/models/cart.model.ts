export interface Cart {
  items: Array<CartItem>;
  discountCode?: string;
  discountAmount?: number;
}
  
  export interface CartItem {
    product: string;
    name: string;
    price: number;
    quantity: number;
    id: number;
  }
  