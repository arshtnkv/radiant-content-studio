import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Page {
  id: string;
  title: string;
  slug: string;
  is_home: boolean;
  is_published: boolean;
}

interface PagesState {
  pages: Page[];
  loading: boolean;
}

const initialState: PagesState = {
  pages: [],
  loading: false,
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    setPages: (state, action: PayloadAction<Page[]>) => {
      state.pages = action.payload;
    },
    addPage: (state, action: PayloadAction<Page>) => {
      state.pages.push(action.payload);
    },
    updatePage: (state, action: PayloadAction<Page>) => {
      const index = state.pages.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.pages[index] = action.payload;
      }
    },
    deletePage: (state, action: PayloadAction<string>) => {
      state.pages = state.pages.filter(p => p.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setPages, addPage, updatePage, deletePage, setLoading } = pagesSlice.actions;
export default pagesSlice.reducer;
