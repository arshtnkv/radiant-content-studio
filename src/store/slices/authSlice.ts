import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
}

interface Session {
  access_token: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User | null; session: Session | null; isAdmin: boolean }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isAdmin = action.payload.isAdmin;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.session = null;
      state.isAdmin = false;
    },
  },
});

export const { setAuth, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
