import { apiFetch, saveToken } from './http';
import type {
  AuthResponse,
  StudiosSearchResponse,
  StudioDetailResponse,
  StudioAvailabilityResponse,
  BookingCreateResponse,
  BookingCancelResponse,
  BookingRescheduleResponse,
  PaymentCheckoutResponse,
  PromoApplyResponse,
  InvoiceResponse,
  NotificationsListResponse,
  NotificationsMarkReadResponse,
  ReviewCreateResponse,
  BookingHistoryResponse,
  StudioCreateResponse,
  BookingAcceptResponse,
  BookingRejectResponse,
} from '../types/api';

// Auth
export async function authSignup(payload: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  user_type?: 'client' | 'photographer' | 'studio_owner';
}): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth-signup', { method: 'POST', body: payload, auth: false });
  if (res?.session?.access_token) await saveToken(res.session.access_token);
  return res;
}

export async function authLogin(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth-login', { method: 'POST', body: payload, auth: false });
  if (res?.session?.access_token) await saveToken(res.session.access_token);
  return res;
}

// Profile
export async function getUserProfile() {
  return apiFetch<{ profile: any }>('/user-profile', { method: 'GET' });
}

export async function updateUserProfile(payload: any) {
  return apiFetch<{ message: string; profile: any }>('/user-profile', { method: 'PUT', body: payload });
}

export async function kycUpload(payload: { document_type: string; document_url: string }) {
  return apiFetch<{ message: string; document: any }>('/kyc-upload', { method: 'POST', body: payload });
}

// Studios
export async function studiosSearch(query?: Record<string, string | number | boolean>) {
  return apiFetch<StudiosSearchResponse>('/studios-search', { method: 'GET', query, auth: false });
}

export async function studioDetail(id: string) {
  return apiFetch<StudioDetailResponse>(`/studio-detail/${id}`, { method: 'GET', auth: false });
}

export async function studioFavorites() {
  return apiFetch<{ favorites: any[] }>('/studio-favorites', { method: 'GET' });
}

export async function studioFavorite(payload: { studio_id: string; action: 'add' | 'remove' }) {
  return apiFetch<{ message: string; favorite?: any }>(`/studio-favorite`, { method: 'POST', body: payload });
}

export async function studioAvailability(id: string, date?: string) {
  return apiFetch<StudioAvailabilityResponse>(`/studio-availability/${id}`, { method: 'GET', query: { date }, auth: false });
}

// Booking
export async function bookingCreate(payload: { studio_id: string; booking_date: string; start_time: string; end_time: string; total_amount?: number }) {
  return apiFetch<BookingCreateResponse>('/booking-create', { method: 'POST', body: payload });
}

export async function bookingCancel(id: string, reason?: string) {
  return apiFetch<BookingCancelResponse>(`/booking-cancel/${id}`, { method: 'PUT', body: reason ? { cancellation_reason: reason } : {} });
}

export async function bookingReschedule(id: string, payload: { new_booking_date: string; new_start_time: string; new_end_time: string }) {
  return apiFetch<BookingRescheduleResponse>(`/booking-reschedule/${id}`, { method: 'PUT', body: payload });
}

export async function bookingInvoice(id: string) {
  return apiFetch<InvoiceResponse>(`/booking-invoice/${id}`, { method: 'GET' });
}

// Payment
export async function paymentCheckout(payload: { booking_id: string; payment_method: string; payment_details?: any }) {
  return apiFetch<PaymentCheckoutResponse>('/payment-checkout', { method: 'POST', body: payload });
}

export async function paymentApplyPromo(payload: { booking_id: string; promo_code: string }) {
  return apiFetch<PromoApplyResponse>('/payment-apply-promo', { method: 'POST', body: payload });
}

// Notifications
export async function notificationsList(query?: { unread_only?: boolean; limit?: number }) {
  return apiFetch<NotificationsListResponse>('/notifications-list', { method: 'GET', query });
}

export async function notificationsMarkRead(payload: { notification_ids: string[] }) {
  return apiFetch<NotificationsMarkReadResponse>('/notifications-mark-read', { method: 'POST', body: payload });
}

// Post-Booking
export async function bookingCheckin(id: string, payload?: { notes?: string }) {
  return apiFetch<{ message: string; booking: any }>(`/booking-checkin/${id}`, { method: 'POST', body: payload ?? {} });
}

export async function bookingCheckout(id: string, payload?: { notes?: string }) {
  return apiFetch<{ message: string; booking: any }>(`/booking-checkout/${id}`, { method: 'POST', body: payload ?? {} });
}

export async function reviewCreate(payload: { booking_id: string; studio_id: string; rating: number; comment?: string }) {
  return apiFetch<ReviewCreateResponse>('/review-create', { method: 'POST', body: payload });
}

export async function bookingHistory(query?: { status?: string; limit?: number }) {
  return apiFetch<BookingHistoryResponse>('/booking-history', { method: 'GET', query });
}

export async function StudioCreate(payload: {
  name: string;
  description: string;
  location: object;
  pricing: object;
  amenities: string[];
}) {
  return apiFetch<StudioCreateResponse>('/studio-create', { method: 'POST', body: payload });
}

export async function bookingAccept(body: { booking_id: string }) {
  return apiFetch<BookingAcceptResponse>('/booking-accept', {
    method: 'POST',
    body,
  });
}

export async function bookingReject(body: { booking_id: string; reason?: string }) {
  return apiFetch<BookingRejectResponse>('/booking-reject', {
    method: 'POST',
    body,
  });
}