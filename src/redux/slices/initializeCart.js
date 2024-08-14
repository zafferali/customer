import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCart } from './cartSlice';

export const initializeCart = () => {
  return async dispatch => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        // Dispatch an action to set the entire cart state
        dispatch(setCart(parsedCart));
      }
    } catch (error) {
      console.error('Error loading cart from AsyncStorage:', error);
    }
  };
};
