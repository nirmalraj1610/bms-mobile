import { apiFetch, saveToken, saveUserData } from './http';
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
  PhotographersSearchResponse,
  PhotographerDetailResponse,
  photographerReviewCreateResponse,
  photographerCreateResponse,
  PhotographerServicePayload,
  PhotographerServiceResponse,
  PhotographerServiceListResponse,
  PhotographerServiceUpdatePayload,
  PhotographerProfileResponse,
  PhotographerPortfolioUploadResponse,
  PhotographerPortfolioUploadPayload,
  UpdatePhotographerTimeSlotsResponse,
  UpdatePhotographerTimeSlotsPayload,
} from '../types/api';
import { StudioEquipmentPayload } from '../features/studios/studios.types';

// Auth
export async function authSignup(payload: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  user_type?: 'client' | 'photographer' | 'studio_owner';
  user_metadata?: { full_name?: string; user_type?: 'client' | 'photographer' | 'studio_owner'; phone?: string };
}): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth-signup', { method: 'POST', body: payload, auth: false });
  if (res?.session?.access_token) await saveToken(res.session.access_token);
  if (res?.session?.access_token) await saveUserData(res);
  return res;
}

export async function authLogin(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth-login', { method: 'POST', body: payload, auth: false });
  if (res?.session?.access_token) await saveToken(res.session.access_token);
  if (res?.session?.access_token) await saveUserData(res);
  return res;
}

// Profile
export async function getUserProfile() {
  return apiFetch<{ profile: any }>('/user-profile', { method: 'GET' });
}

export async function updateUserProfile(payload: any) {
  return apiFetch<{ message: string; profile: any }>('/user-profile', { method: 'PUT', body: payload });
}

export async function updateProfileImageApi(formData: any) {
  return apiFetch<{ message: string; profile: any }>('/user-profile', { method: 'POST', body: formData });
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

// ✅ 1️⃣ Base API call with query params
export async function myStudios(params?: { status?: string; include_stats?: boolean }) {
  // Build query string dynamically
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append("status", params.status);
  if (params?.include_stats !== undefined)
    queryParams.append("include_stats", String(params.include_stats));

  const queryString = queryParams.toString() ? `?${queryParams}` : "";

  return apiFetch<{ studios: any[] }>(`/studio-owner-studios${queryString}`, {
    method: "GET",
  });
}

// ✅ 1️⃣ Base API call with query params
export async function studiosBookings(params: {
  studio_id: string; // required
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}) {
  // Build query string dynamically
  const queryParams = new URLSearchParams();

  if (params?.studio_id) queryParams.append("studio_id", params.studio_id);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.from_date) queryParams.append("from_date", params.from_date);
  if (params?.to_date) queryParams.append("to_date", params.to_date);
  if (params?.limit !== undefined) queryParams.append("limit", String(params.limit));
  if (params?.offset !== undefined) queryParams.append("offset", String(params.offset));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return apiFetch<{ bookings: any[] }>(`/studio-bookings${queryString}`, {
    method: "GET",
  });
}

export async function studioFavorite(payload: { studio_id: string; action: 'add' | 'remove' }) {
  return apiFetch<{ message: string; favorite?: any }>(`/studio-favorite`, { method: 'POST', body: payload });
}

export async function studioAvailability(id: string, date?: string) {
  return apiFetch<StudioAvailabilityResponse>(`/studio-availability/studios/${id}`, { method: 'GET', query: { date }, auth: false });
}

export async function studioEquipmentList(studio_id: string, available_only?: boolean) {
  const query: Record<string, string | boolean> = { studio_id };
  if (available_only !== undefined) {
    query.available_only = available_only;
  }
  return apiFetch<{ equipment: any[] }>('/studio-equipment-list', { method: 'GET', query, auth: true });
}

// Photographers
export async function photographersSearch(query?: Record<string, string | number | boolean>) {
  return apiFetch<PhotographersSearchResponse>('/photographer-search', { method: 'GET', query, auth: false });
}

export async function photographerDetail(id: string) {
  return apiFetch<PhotographerDetailResponse>(`/photographer-detail/${id}`, { method: 'GET', auth: false });
}

export async function photographerAvailability(id: string, date?: string) {
  // Attach auth to avoid unauthorized logs and ensure protected endpoints work
  return apiFetch<any>(`/photographer-availability`, { method: 'GET', query: { photographer_id: id, date }, auth: true });
}

export async function photographerBookingCreate(payload: { booking_id: string; photographer_id: string; service_id: string }) {
  return apiFetch<BookingCreateResponse>('/booking-photographer', { method: 'POST', body: payload });
}

// ✅ 1️⃣ Base API call with query params
export async function photographerBookings(params: {
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}) {
  // Build query string dynamically
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append("status", params.status);
  if (params?.from_date) queryParams.append("from_date", params.from_date);
  if (params?.to_date) queryParams.append("to_date", params.to_date);
  if (params?.limit !== undefined) queryParams.append("limit", String(params.limit));
  if (params?.offset !== undefined) queryParams.append("offset", String(params.offset));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return apiFetch<{ bookings: any[] }>(`/photographer-bookings${queryString}`, {
    method: "GET",
  });
}

export async function createPhotographerBooking(payload: {
  photographer_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number
}) {
  return apiFetch<BookingCreateResponse>('/photographer-booking-create', { method: 'POST', body: payload });
}

export async function photographerReviewCreate(payload: { booking_id: string; photographer_id: string; rating: number; comment?: string }) {
  return apiFetch<photographerReviewCreateResponse>('/photographerReview-create', { method: 'POST', body: payload });
}

export async function photographerCreate(payload: {
  name: string;
  description: string;
  location: object;
  pricing: object;
  amenities: string[];
}) {
  return apiFetch<photographerCreateResponse>('/photographer-create', { method: 'POST', body: payload });
}

export async function postPhotographerService(
  payload: PhotographerServicePayload
): Promise<PhotographerServiceResponse> {
  return apiFetch<PhotographerServiceResponse>('/photographer-services-create', {
    method: 'POST',
    body: payload,
  });
}

export async function getPhotographerServicesApi(
  photographerId: string
): Promise<PhotographerServiceListResponse> {
  return apiFetch<PhotographerServiceListResponse>(
    `/photographer-services-list?photographer_id=${photographerId}`,
    { method: 'GET', auth: false }
  );
}

export const photographerServices = getPhotographerServicesApi;

export async function updatePhotographerServiceApi(
  payload: PhotographerServiceUpdatePayload
): Promise<PhotographerServiceResponse> {
  return apiFetch<PhotographerServiceResponse>('/photographer-services-update', {
    method: 'PUT',
    body: payload,
  });
}

export async function getPhotographerProfileApi(
  photographerId: string
): Promise<PhotographerProfileResponse> {
  return apiFetch<PhotographerProfileResponse>(
    `/photographer-profile?photographer_id=${photographerId}`,
    { method: 'GET', auth: false }
  );
}

export async function createPhotographerPortfolioApi(
  payload: PhotographerPortfolioUploadPayload
): Promise<PhotographerPortfolioUploadResponse> {
  return apiFetch<PhotographerPortfolioUploadResponse>('/photographer-portfolio-upload', {
    method: 'POST',
    body: payload,
  });
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
  // Prefer body-based ID; fallback to path variant if needed
  try {
    return await apiFetch<{ message: string; booking: any }>(`/booking-checkin`, {
      method: 'POST',
      body: { booking_id: id, ...(payload ?? {}) },
    });
  } catch (err: any) {
    return await apiFetch<{ message: string; booking: any }>(`/booking-checkin/${id}`, {
      method: 'POST',
      body: payload ?? {},
    });
  }
}

export async function bookingCheckout(id: string, payload?: { notes?: string }) {
  // Prefer body-based ID; fallback to path variant if needed
  try {
    return await apiFetch<{ message: string; booking: any }>(`/booking-checkout`, {
      method: 'POST',
      body: { booking_id: id, ...(payload ?? {}) },
    });
  } catch (err: any) {
    return await apiFetch<{ message: string; booking: any }>(`/booking-checkout/${id}`, {
      method: 'POST',
      body: payload ?? {},
    });
  }
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

export async function updatePhotographerTimeSlots(payload: UpdatePhotographerTimeSlotsPayload) {
  return apiFetch<UpdatePhotographerTimeSlotsResponse>(
    '/photographer-availability-manage',
    {
      method: 'POST',
      body: payload,
    }
  );
}

export async function getPhotographerTimeSlotsApi(): Promise<UpdatePhotographerTimeSlotsResponse> {
  return apiFetch<UpdatePhotographerTimeSlotsResponse>(
    '/photographer-availability-manage',
    { method: 'GET' }
  );
}

export async function StudioUpdate(payload: {
  name: string;
  description: string;
  location: object;
  pricing: object;
  amenities: string[];
}) {
  return apiFetch<StudioCreateResponse>('/studio-update', { method: 'POST', body: payload });
}

export async function StudioEquipCreate(payload: StudioEquipmentPayload) {
  return apiFetch<StudioCreateResponse>('/studio-equipment-manage', { method: 'POST', body: payload });
}

export async function StudioEquipUpdate(payload: StudioEquipmentPayload) {
  return apiFetch<StudioCreateResponse>('/studio-equipment-manage', { method: 'PUT', body: payload });
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

// Add equipment to an existing booking
export async function bookingAddEquipment(payload: {
  booking_id: string;
  equipment_items: { equipment_id: string; quantity: number }[];
}): Promise<{ message: string; booking?: any }> {
  // Prefer body-based ID; fallback to path variant if the server expects URL param.
  try {
    return await apiFetch<{ message: string; booking?: any }>(
      '/booking-add-equipment',
      { method: 'POST', body: payload }
    );
  } catch (err: any) {
    // Retry using path param style: /booking-add-equipment/:booking_id
    try {
      return await apiFetch<{ message: string; booking?: any }>(
        `/booking-add-equipment/${payload.booking_id}`,
        { method: 'POST', body: { equipment_items: payload.equipment_items } }
      );
    } catch (err2: any) {
      throw err2;
    }
  }
}