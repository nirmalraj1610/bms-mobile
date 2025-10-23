import { configureStore } from '@reduxjs/toolkit';
import bookingsReducer from '../features/bookings/bookingsSlice';
import profileReducer from '../features/profile/profileSlice';
import paymentsReducer from '../features/payments/paymentsSlice';
import studiosReducer from '../features/studios/studiosSlice';
import authReducer from '../features/auth/authSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import photographersReducer from '../features/photographers/photographersSlice';

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    profile: profileReducer,
    payments: paymentsReducer,
    studios: studiosReducer,
    auth: authReducer,
    notifications: notificationsReducer,
    photographers: photographersReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;