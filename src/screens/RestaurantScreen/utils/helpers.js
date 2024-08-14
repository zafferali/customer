import { createSelector } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import { addToCart, removeFromCart } from 'redux/slices/cartSlice';

export const addItem = (item, customisations, dispatch, openModal) => {
  if (item.customisations && item.customisations.length > 0) {
    openModal(item, customisations);
  } else {
    dispatch(
      addToCart({
        name: item.name,
        itemId: item.id,
        quantity: 1,
        price: item.price,
        temperature: item.temperature,
        thumbnailUrl: item.thumbnailUrl,
        customisations: [],
      }),
    );
  }
};

export const removeItem = (cartItemId, dispatch) => {
  dispatch(removeFromCart({ cartItemId }));
};

export const selectItemQuantity = createSelector(
  state => state.cart.items,
  (state, data) => data.id,
  (items, itemId) => {
    const filteredItems = items.filter(item => item.itemId === itemId);
    return filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  },
);

export const checkAvailability = ({ from, until, isAvailable }, selectedTime) => {
  if (!isAvailable) return false;
  const selectedTimeDate = parseTime(selectedTime);
  const startTime = parseTime(from);
  const endTime = parseTime(until);
  return (
    selectedTimeDate && startTime && endTime && selectedTimeDate >= startTime && selectedTimeDate <= endTime
  );
};

export const parseTime = timeStr => {
  if (!timeStr) {
    return null;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  const time = new Date();
  time.setHours(hours, minutes);
  return time;
};

export const generateSubtitle = (required, multiOption, limit) => {
  if (required) {
    if (multiOption && limit > 1) {
      return `Required *Select up to ${limit} options`;
    } else {
      return 'Required *Select any 1 option';
    }
  } else {
    return `Select any ${limit} option`;
  }
};

export const createOrUpdateCart = async (cartState, customerId, restaurantId) => {
  try {
    const cartRef = firestore().collection('carts').doc(customerId);
    await cartRef.set(
      {
        ...cartState,
        customerId,
        restaurantId,
        orderComplete: false,
      },
      { merge: true },
    );
  } catch (error) {
    console.log('Error creating or updating cart: ', error);
  }
};
