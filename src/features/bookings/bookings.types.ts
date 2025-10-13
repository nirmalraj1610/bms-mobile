import type { BookingHistoryItem, BookingAcceptItem, BookingRejectItem } from '../../types/api';

export type BookingsState = {
  items: BookingHistoryItem[];
  loading: boolean;
  creating?: boolean;
  error?: string | null;
  lastAction?: { type: 'cancel' | 'reschedule' | 'checkin' | 'checkout' | 'accept' | 'reject'; id: string; success: boolean } | null;
  accept: {
    loading: boolean,
    error: string | null,
    booking: BookingAcceptItem | null,
  };
  reject: {
    loading: boolean,
    error: string | null,
    booking: BookingRejectItem | null,
  }
};

export type BookingsHistoryPayload = { limit?: number; status?: string };
export type BookingCancelPayload = { booking_id: string; reason?: string };
export type BookingReschedulePayload = { booking_id: string; new_booking_date: string; new_start_time: string; new_end_time: string };
export type BookingCheckPayload = { booking_id: string; notes?: string };