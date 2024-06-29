import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    placeOrder(state, action) {
      state.orders.push(action.payload);
    },
    cancelOrder(state, action) {
      state.orders = state.orders.filter(order => order.id !== action.payload.id);
    },
    fetchOrders(state, action) {
      state.orders = action.payload;
    },
  },
});

export const { placeOrder, cancelOrder, fetchOrders } = ordersSlice.actions;

export default ordersSlice.reducer;
