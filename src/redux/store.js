import { configureStore , getDefaultMiddleware} from '@reduxjs/toolkit';
import authenticationReducer from '../redux/slices/authenticationSlice';
import cartReducer from 'slices/cartSlice';
import ordersReducer from 'slices/ordersSlice';
import uiReducer from 'slices/uiSlice';
import restaurantsReducer from 'slices/restaurantsSlice';
import menuReducer from 'slices/menuSlice';

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
