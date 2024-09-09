import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrderId: null,
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
    setCurrentOrderId(state, action) {
      state.currentOrderId = action.payload;
    },
  },
});

export const { placeOrder, cancelOrder, fetchOrders, setCurrentOrderId } = ordersSlice.actions;

export default ordersSlice.reducer;
