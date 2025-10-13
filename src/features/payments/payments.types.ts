export type PaymentsState = {
  loading: boolean;
  error: string | null;
  promo: null | {
    code: string;
    final_amount: number;
    discount_amount?: number;
    discount_percent?: number;
  };
  checkout: null | {
    payment_id: string;
    booking_id: string;
    status: string;
    final_amount: number;
  };
};