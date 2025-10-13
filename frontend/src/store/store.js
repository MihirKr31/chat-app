import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import chatReducer from './chatSlice.js'  // authSlice.js will be created soon

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat:chatReducer,
  },
});

export default store;
