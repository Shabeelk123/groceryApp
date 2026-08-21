// ✅ CORRECT for ESM + TypeScript + Vite
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


interface User {
  id: number;
  name: string;
  email: string;
  cartItems: string[];
}

interface UserState {
  user: User | null;
  showUserLogin: boolean;
  wishlist: number[]; // product IDs — kept in sync with the server via the wishlist endpoints
}

const initialState: UserState = {
  user: null,
  showUserLogin: false,
  wishlist: [],
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User|null>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.wishlist = [];
    },
    setShowUserLogin(state, action: PayloadAction<boolean>) {
      state.showUserLogin = action.payload;
    },
    updateCartItems(state, action: PayloadAction<string[]>) {
      if (state.user) {
        state.user.cartItems = action.payload;
      }
    },
    setWishlist(state, action: PayloadAction<number[]>) {
      state.wishlist = action.payload;
    },
    addWishlistItem(state, action: PayloadAction<number>) {
      if (!state.wishlist.includes(action.payload)) {
        state.wishlist.push(action.payload);
      }
    },
    removeWishlistItem(state, action: PayloadAction<number>) {
      state.wishlist = state.wishlist.filter((id) => id !== action.payload);
    },
  },
});

export const { setUser, clearUser, setShowUserLogin, updateCartItems, setWishlist, addWishlistItem, removeWishlistItem } = userSlice.actions;

export default userSlice.reducer;
