import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import cartReducer from 'redux/slices/cartSlice';
import ordersReducer from 'redux/slices/ordersSlice';
import uiReducer from 'redux/slices/uiSlice';
import restaurantsReducer from 'redux/slices/restaurantsSlice';
import menuReducer from 'redux/slices/menuSlice';
import authenticationReducer from 'redux/slices/authenticationSlice';

const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    cart: cartReducer,
    orders: ordersReducer,
    ui: uiReducer,
    restaurants: restaurantsReducer,
    menu: menuReducer,
    // middleware: getDefaultMiddleware({
    //   immutableCheck: false,
    //   serializableCheck: false,
    // }),
  },
});

export default store;
