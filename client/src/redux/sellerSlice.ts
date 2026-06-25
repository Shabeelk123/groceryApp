import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Seller {
    name: string;
    email: string;
    // add more fields if needed (like token, id, etc.)
}

interface Product {
    name: string;
    category: string;
    price: number;
    offerPrice: number;
    inStock: boolean;
    image: string;
}

interface Order {
    id: number;
    items: { product: { name: string }, quantity: number }[];
    address: { firstName: string, lastName: string, street: string, city: string, state: string, zipcode: string, country: string };
    amount: number;
    paymentType: string;
    createdAt: string;
    isPaid: boolean;
}

interface SellerState {
    seller: Seller | null;
    showSellerLogin: boolean;
    products: Product[];
    orders: Order[];
}

const initialState: SellerState = {
    seller: null,
    showSellerLogin: true,
    products: [],
    orders: [],
};

const sellerSlice = createSlice({
    name: 'seller',
    initialState,
    reducers: {
        setShowSellerLogin: (state, action: PayloadAction<boolean>) => {
            state.showSellerLogin = action.payload;
        },
        setSeller: (state, action: PayloadAction<Seller>) => {
            state.seller = action.payload;
        },
        setProducts: (state, action: PayloadAction<Product[]>) => {
            state.products = action.payload;
        },
        setOrders: (state, action: PayloadAction<Order[]>) => {
            state.orders = action.payload;
        },
    },
});

export const { setShowSellerLogin, setSeller, setProducts, setOrders } = sellerSlice.actions;
export default sellerSlice.reducer;

