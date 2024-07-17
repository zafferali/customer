import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  available: [],
  unavailable: [],
  selectedTimeSlot: null,
  currentRestaurant: null,
};

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setRestaurants(state, action) {
      state.available = action.payload.available;
      state.unavailable = action.payload.unavailable;
    },
    clearRestaurants(state) {
      state.available = [];
      state.unavailable = [];
    },
    setTimeSlot(state, action) {
      state.selectedTimeSlot = action.payload;
    },
    setCurrentRestaurant(state, action) {
      state.currentRestaurant = action.payload;
    },
    clearCurrentRestaurant(state) {
      state.currentRestaurant = null;
    },
  },
});

export const { setRestaurants, clearRestaurants, setTimeSlot, setCurrentRestaurant, clearCurrentRestaurant } =
  restaurantsSlice.actions;

export default restaurantsSlice.reducer;
