import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    count: 0
}

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        increment(state) {
            state.count = state.count + 1;
        },
        decrement(state) {
            state.count = state.count - 1;
        }
    }
})

export const {increment, decrement} = menuSlice.actions;

export default menuSlice.reducer;