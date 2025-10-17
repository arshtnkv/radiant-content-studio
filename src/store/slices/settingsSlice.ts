import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  logoUrl: string | null;
  siteName: string;
  loading: boolean;
}

const initialState: SettingsState = {
  logoUrl: null,
  siteName: 'My Website',
  loading: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<{ logoUrl: string | null; siteName: string }>) => {
      state.logoUrl = action.payload.logoUrl;
      state.siteName = action.payload.siteName;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setSettings, setLoading } = settingsSlice.actions;
export default settingsSlice.reducer;
