import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { BookingsState } from './bookings.types';
import { fetchBookingHistory, fetchBookingReject, fetchBookingAccept, cancelBooking, rescheduleBooking, checkinBooking, checkoutBooking, createBooking, fetchBookingInvoice } from './bookings.service';
import type { BookingHistoryItem, BookingAcceptItem, BookingRejectItem } from '../../types/api';

const initialState: BookingsState = {
  items: [],
  loading: false,
  creating: false,
  error: null,
  lastAction: null,
  accept: {
    loading: false,
    error: null,
    booking: null
  },
  reject: {
    loading: false,
    error: null,
    booking: null
  },
};

export const getBookings = createAsyncThunk('bookings/list', async (payload: { limit?: number; status?: string }) => {
  const res = await fetchBookingHistory(payload);
  return res.bookings as BookingHistoryItem[];
});

export const doCancelBooking = createAsyncThunk('bookings/cancel', async (payload: { booking_id: string; reason?: string }) => {
  const res = await cancelBooking(payload);
  return res.booking;
});

export const doRescheduleBooking = createAsyncThunk('bookings/reschedule', async (payload: { booking_id: string; new_booking_date: string; new_start_time: string; new_end_time: string }) => {
  const res = await rescheduleBooking(payload);
  return res.booking;
});

export const doCheckinBooking = createAsyncThunk('bookings/checkin', async (payload: { booking_id: string; notes?: string }) => {
  const res = await checkinBooking(payload);
  return { id: payload.booking_id, message: res.message };
});

export const doCheckoutBooking = createAsyncThunk('bookings/checkout', async (payload: { booking_id: string; notes?: string }) => {
  const res = await checkoutBooking(payload);
  return { id: payload.booking_id, message: res.message };
});

export const doCreateBooking = createAsyncThunk(
  'bookings/create',
  async (payload: { studio_id: string; booking_date: string; start_time: string; end_time: string; total_amount?: number }) => {
    const res = await createBooking(payload);
    return res.booking;
  }
);

export const getBookingInvoice = createAsyncThunk('bookings/invoice', async (booking_id: string) => {
  const res = await fetchBookingInvoice(booking_id);
  return res.invoice;
});

export const doAcceptBooking = createAsyncThunk(
  'bookings/accept',
  async (payload: { booking_id: string }) => {
    const res = await fetchBookingAccept(payload);
    return res.booking as BookingAcceptItem;
  }
);

export const doRejectBooking = createAsyncThunk(
  'bookings/reject',
  async (payload: { booking_id: string; reason?: string }) => {
    const res = await fetchBookingReject(payload);
    return res.booking as BookingRejectItem;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load bookings';
      })
      .addCase(doCancelBooking.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        state.items = state.items.map((b) => (b.id === id ? { ...b, status } : b));
        state.lastAction = { type: 'cancel', id, success: true };
      })
      .addCase(doRescheduleBooking.fulfilled, (state, action) => {
        const { id, booking_date, start_time, end_time } = action.payload;
        state.items = state.items.map((b) => (b.id === id ? { ...b, booking_date, start_time, end_time } : b));
        state.lastAction = { type: 'reschedule', id, success: true };
      })
      .addCase(doCheckinBooking.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.lastAction = { type: 'checkin', id, success: true };
      })
      .addCase(doCheckoutBooking.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.lastAction = { type: 'checkout', id, success: true };
      })
      .addCase(doCreateBooking.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(doCreateBooking.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.items = [action.payload, ...state.items];
        state.lastAction = { type: 'checkin', id, success: true };
        state.creating = false;
      })
      .addCase(doCreateBooking.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      .addCase(doAcceptBooking.pending, (state) => {
        state.accept.loading = true;
        state.accept.error = null;
        state.accept.booking = null;
      })
      .addCase(doAcceptBooking.fulfilled, (state, action) => {
        state.accept.loading = false;
        state.accept.booking = action.payload;
      })
      .addCase(doAcceptBooking.rejected, (state, action) => {
        state.accept.loading = false;
        state.accept.error = action.error.message || 'Failed to accept booking';
      })
      .addCase(doRejectBooking.pending, (state) => {
        state.reject.loading = true;
        state.reject.error = null;
        state.reject.booking = null;
      })
      .addCase(doRejectBooking.fulfilled, (state, action) => {
        state.reject.loading = false;
        state.reject.booking = action.payload;
      })
      .addCase(doRejectBooking.rejected, (state, action) => {
        state.reject.loading = false;
        state.reject.error = action.error.message || 'Failed to reject booking';
      });
  },
});

export default bookingsSlice.reducer;