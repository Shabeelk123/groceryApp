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
}

const initialState: UserState = {
  user: null,
  showUserLogin: false,
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
    },
    setShowUserLogin(state, action: PayloadAction<boolean>) {
      state.showUserLogin = action.payload;
    },
    updateCartItems(state, action: PayloadAction<string[]>) {
      if (state.user) {
        state.user.cartItems = action.payload;
      }
    },
  },
});

export const { setUser, clearUser, setShowUserLogin, updateCartItems } = userSlice.actions;

export default userSlice.reducer;
