import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customer: null,
  isAuthenticated: false,
  isFirstTime: false,
};

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    login(state, action) {
      state.customer = action.payload;
      state.isAuthenticated = true;
      state.isFirstTime = false;
    },
    logout(state) {
      state.customer = null;
      state.isAuthenticated = false;
    },
    register(state, action) {
      state.customer = action.payload;
      state.isAuthenticated = true;
      state.isFirstTime = true;
    },
    updateCustomer(state, action) {
      const { name, photoUrl } = action.payload;
      if (state.customer) {
        state.customer.name = name;
        state.customer.photoUrl = photoUrl;
      }
    },
  },
});

export const { login, logout, register, updateCustomer } = authenticationSlice.actions;

export default authenticationSlice.reducer;