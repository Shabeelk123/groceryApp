// ✅ CORRECT for ESM + TypeScript + Vite
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


interface User {
  name: string;
  email: string;
  // add more fields if needed (like token, id, etc.)
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
  },
});

export const { setUser, clearUser, setShowUserLogin } = userSlice.actions;

export default userSlice.reducer;
