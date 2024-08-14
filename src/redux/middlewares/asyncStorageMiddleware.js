import AsyncStorage from '@react-native-async-storage/async-storage';

const asyncStorageMiddleware = store => next => action => {
  const result = next(action);
  const state = store.getState();

  // Check if the action is related to the cart
  if (action.type.startsWith('cart/')) {
    // Store the entire cart state in AsyncStorage
    AsyncStorage.setItem('cart', JSON.stringify(state.cart)).catch(error =>
      console.error('Error saving cart to AsyncStorage:', error),
    );
  }

  return result;
};

export default asyncStorageMiddleware;
