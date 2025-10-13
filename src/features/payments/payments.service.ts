import { paymentApplyPromo, paymentCheckout } from '../../lib/api';

export const applyPromo = async (payload: { booking_id: string; promo_code: string }) => {
  return paymentApplyPromo(payload);
};

export const checkoutPayment = async (payload: { booking_id: string; payment_method: string; payment_details?: any }) => {
  return paymentCheckout(payload);
};