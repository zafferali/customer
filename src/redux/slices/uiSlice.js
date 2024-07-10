import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  otpError: null,
  modalVisible: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleLoading(state) {
      state.loading = !state.loading;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setOtpError(state, action) {
      state.otpError = action.payload;
    },
    clearOtpError(state) {
      state.otpError = null;
    },
    toggleModal(state) {
      state.modalVisible = !state.modalVisible;
    },
  },
});

export const { toggleLoading, setError, clearError, setOtpError, clearOtpError, toggleModal } = uiSlice.actions;

export default uiSlice.reducer;
