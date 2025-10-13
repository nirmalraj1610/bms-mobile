import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PaymentsState } from './payments.types';
import { applyPromo, checkoutPayment } from './payments.service';

const initialState: PaymentsState = {
  loading: false,
  error: null,
  promo: null,
  checkout: null,
};

export const doApplyPromo = createAsyncThunk('payments/applyPromo', async (payload: { booking_id: string; promo_code: string }) => {
  const res = await applyPromo(payload);
  return res.discount;
});

export const doCheckout = createAsyncThunk('payments/checkout', async (payload: { booking_id: string; payment_method: string }) => {
  const res = await checkoutPayment(payload);
  return res.payment;
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPromo(state) {
      state.promo = null;
    },
    clearCheckout(state) {
      state.checkout = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(doApplyPromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(doApplyPromo.fulfilled, (state, action) => {
        state.loading = false;
        state.promo = action.payload ? {
          code: action.payload.code,
          final_amount: action.payload.final_amount,
          discount_amount: action.payload.discount_amount,
          discount_percent: action.payload.discount_percent,
        } : null;
      })
      .addCase(doApplyPromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to apply promo';
      })
      .addCase(doCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(doCheckout.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        state.checkout = p ? { payment_id: p.id, booking_id: p.booking_id, status: p.status, final_amount: p.final_amount } : null;
      })
      .addCase(doCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Checkout failed';
      });
  },
});

export const { clearPromo, clearCheckout } = paymentsSlice.actions;
export default paymentsSlice.reducer;