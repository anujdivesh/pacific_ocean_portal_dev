// offcanvasSlice.js
import { createSlice } from '@reduxjs/toolkit';

const offcanvasSlice = createSlice({
  name: 'offcanvas',
  initialState: {
    isVisible: false,
    currentId: null, // Add this to track the current item id
  },
  reducers: {
    showoffCanvas: (state, action) => {
      state.isVisible = true;
      state.currentId = action.payload; // Set the current id
    },
    hideoffCanvas: (state) => {
      state.isVisible = false;
      state.currentId = null; // Reset the current id
    },
  },
});

export const { showoffCanvas, hideoffCanvas } = offcanvasSlice.actions;
export default offcanvasSlice.reducer;