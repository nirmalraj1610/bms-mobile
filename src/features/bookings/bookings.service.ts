import { bookingHistory, bookingReject, bookingAccept, bookingCancel, bookingReschedule, bookingCheckin, bookingCheckout, bookingCreate, bookingInvoice } from '../../lib/api';
import type { BookingHistoryResponse, BookingRejectResponse, BookingAcceptResponse, BookingCancelResponse, BookingRescheduleResponse, BookingCreateResponse, InvoiceResponse } from '../../types/api';

export const fetchBookingHistory = async (payload: { limit?: number; status?: string }): Promise<BookingHistoryResponse> => {
  return bookingHistory(payload);
};

export const cancelBooking = async (payload: { booking_id: string; cancellation_reason?: string }): Promise<BookingCancelResponse> => {
  return bookingCancel(payload.booking_id, payload.cancellation_reason);
};

export const rescheduleBooking = async (payload: { booking_id: string; new_booking_date: string; new_start_time: string; new_end_time: string }): Promise<BookingRescheduleResponse> => {
  const { booking_id, ...body } = payload;
  return bookingReschedule(booking_id, body);
};

export const checkinBooking = async (payload: { booking_id: string; notes?: string }): Promise<{ message: string }> => {
  const { booking_id, notes } = payload;
  return bookingCheckin(booking_id, notes ? { notes } : undefined);
};

export const checkoutBooking = async (payload: { booking_id: string; notes?: string }): Promise<{ message: string }> => {
  const { booking_id, notes } = payload;
  return bookingCheckout(booking_id, notes ? { notes } : undefined);
};

export const createBooking = async (payload: { studio_id: string; booking_date: string; start_time: string; end_time: string; total_amount?: number }): Promise<BookingCreateResponse> => {
  return bookingCreate(payload);
};

export const fetchBookingInvoice = async (booking_id: string): Promise<InvoiceResponse> => {
  return bookingInvoice(booking_id);
};

export const fetchBookingAccept = async (
  payload: { booking_id: string }
): Promise<BookingAcceptResponse> => {
  return bookingAccept(payload);
};

export const fetchBookingReject = async (
  payload: { booking_id: string; reason?: string }
): Promise<BookingRejectResponse> => {
  return bookingReject(payload);
};