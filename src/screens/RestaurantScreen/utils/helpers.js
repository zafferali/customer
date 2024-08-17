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
        restaurantId: item.restaurantId,
      }),
    );
  }
};

export const confirmAddItem = (
  item,
  dispatch,
  closeModal,
  restaurantId,
  selectedCustomisations,
  setLastUsedCustomisations,
) => {
  const customisationsWithPrice = Object.entries(selectedCustomisations).map(([key, choices]) => {
    const originalCustomisation = item.customisations.find(c => c.title === key);
    return {
      title: key,
      choices: Array.isArray(choices)
        ? choices.map(choice => ({
            name: choice.name,
            price: Number(choice.price) || 0,
          }))
        : [],
      multiOption: originalCustomisation ? originalCustomisation.multiOption : false,
    };
  });

  setLastUsedCustomisations(prev => ({
    ...prev,
    [item.id]: selectedCustomisations,
  }));

  dispatch(
    addToCart({
      name: item.name,
      itemId: item.id,
      quantity: 1,
      price: Number(item.price) || 0,
      temperature: item.temperature,
      thumbnailUrl: item.thumbnailUrl,
      customisations: customisationsWithPrice,
      restaurantId,
    }),
  );

  closeModal();
};

export const handleCustomisationSelect = (
  customisationTitle,
  choice,
  multiOption,
  limit,
  setSelectedCustomisations,
) => {
  setSelectedCustomisations(prevSelections => {
    const updatedSelections = { ...prevSelections };
    if (!updatedSelections[customisationTitle]) {
      updatedSelections[customisationTitle] = [];
    }

    const choiceExists = updatedSelections[customisationTitle].some(
      selectedChoice => selectedChoice.name === choice.name,
    );

    if (choiceExists) {
      updatedSelections[customisationTitle] = updatedSelections[customisationTitle].filter(
        selectedChoice => selectedChoice.name !== choice.name,
      );
    } else {
      if (multiOption) {
        if (updatedSelections[customisationTitle].length < limit) {
          updatedSelections[customisationTitle].push({ name: choice.name, price: choice.price });
        }
      } else {
        updatedSelections[customisationTitle] = [{ name: choice.name, price: choice.price }];
      }
    }

    return updatedSelections;
  });
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
