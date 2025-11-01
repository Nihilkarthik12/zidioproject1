import { createSlice } from '@reduxjs/toolkit';

const chartSlice = createSlice({
  name: 'charts',
  initialState: {
    currentFileData: null,
    chartHistory: [],
    downloadFormat: 'png',
  },
  reducers: {
    setFileData: (state, action) => {
      state.currentFileData = action.payload;
    },
    addToHistory: (state, action) => {
      state.chartHistory.unshift(action.payload);
    },
    setDownloadFormat: (state, action) => {
      state.downloadFormat = action.payload;
    },
  },
});

export const { setFileData, addToHistory, setDownloadFormat } = chartSlice.actions;
export default chartSlice.reducer;
