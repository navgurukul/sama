// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import ngoReducer from "./ngoSlice"

const store = configureStore({
  reducer: {
    ngo: ngoReducer,
  },
});

export default store;
