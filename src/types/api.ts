export interface Session {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  user_type?: 'client' | 'photographer' | 'studio_owner';
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface StudioSummary {
  id: string;
  name: string;
  description?: string;
  location?: { city?: string; address?: string };
  pricing?: { hourly_rate?: number; daily_rate?: number };
  amenities?: string[];
  status?: string;
  average_rating?: number;
  total_reviews?: number;
  owner?: { full_name?: string };
}

export interface StudiosSearchResponse {
  studios: StudioSummary[];
  total: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at?: string;
  customers?: { full_name?: string };
}

export interface StudioDetail {
  images: any;
  id: string;
  name: string;
  description?: string;
  location?: { city?: string; address?: string; lat?: number; lng?: number };
  pricing?: { hourly_rate?: number; daily_rate?: number; half_day_rate?: number };
  amenities?: string[];
  status?: string;
  average_rating?: number;
  total_reviews?: number;
  customers?: { full_name?: string; email?: string; phone?: string };
  reviews?: Review[];
}

export interface StudioDetailResponse {
  studio: StudioDetail;
}

export interface AvailabilityBookingSlot {
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface StudioAvailabilityResponse {
  booking_slots: { start_time: string; end_time: string; is_booked: boolean }[];
  studio_id: string;
  date?: string;
  bookings: AvailabilityBookingSlot[];
}

export interface Booking {
  id: string;
  studio_id: string;
  customer_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount?: number;
  status: string;
  created_at?: string;
}

export interface BookingCreateResponse {
  message: string;
  booking: Booking;
}

export interface BookingCancelResponse {
  message: string;
  booking: { id: string; status: string };
}

export interface BookingRescheduleResponse {
  message: string;
  booking: { id: string; booking_date: string; start_time: string; end_time: string };
}

export interface Payment {
  id: string;
  booking_id: string;
  amount?: number;
  final_amount: number;
  status: string;
  transaction_id?: string;
  payment_method?: string;
}

export interface PaymentCheckoutResponse {
  message: string;
  payment: Payment;
}

export interface PromoApplyResponse {
  message: string;
  discount: {
    code: string;
    discount_percent?: number;
    original_amount?: number;
    discount_amount?: number;
    final_amount: number;
  };
}

export interface InvoiceResponse {
  invoice: {
    booking_id: string;
    invoice_number: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    studio: { name: string; location?: string };
    customer: { full_name: string; email?: string };
    payment: {
      amount?: number;
      discount_amount?: number;
      final_amount: number;
      payment_method?: string;
      status: string;
      transaction_id?: string;
    };
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface NotificationsListResponse {
  notifications: Notification[];
}

export interface NotificationsMarkReadResponse {
  message: string;
  updated_count: number;
}

export interface ReviewCreateResponse {
  message: string;
  review: Review;
}

export interface BookingHistoryItem extends Booking {
  studios?: { id: string; name: string; location?: { city?: string } };
  payments?: { final_amount: number; status: string; payment_method?: string };
  reviews?: { rating?: number; comment?: string };
}

export interface BookingHistoryResponse {
  bookings: BookingHistoryItem[];
}

export interface Studio {
  id: string;
  owner_id: string;
  name: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
}

export interface StudioCreateResponse {
  studio: Studio;
  message: string;
}

export interface BookingAcceptItem {
  id: string;
  status: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  customer_id: string;
  studio_id: string;
  photographer_id: string;
  created_at: string;
  updated_at: string;
}

export interface BookingAcceptResponse {
  message: string;
  booking: BookingAcceptItem;
}

export interface BookingRejectItem {
  id: string;
  status: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  customer_id: string;
  studio_id: string;
  photographer_id: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRejectResponse {
  message: string;
  booking: BookingRejectItem;
}

export interface PhotographerSummary {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: { city?: string; address?: string };
  specialties?: string[];
  portfolio_images?: string[];
  pricing?: { hourly_rate?: number; daily_rate?: number };
  average_rating?: number;
  total_reviews?: number;
  experience_years?: number;
  verified?: boolean;
  status?: string;
}

export interface PhotographersSearchResponse {
  photographers: PhotographerSummary[];
  total: number;
}

// Enhanced photographer interfaces from web app
export interface PhotographerService {
  id: string;
  title: string;
  description: string;
  service_type: string;
  base_price: number;
  duration_hours: number;
  equipment_included: string[];
  active: boolean;
}

export interface PhotographerSearchResult {
  id: string;
  full_name: string;
  email: string;
  profile_image_url: string;
  bio: string;
  average_rating: number;
  total_reviews: number;
  services: PhotographerService[];
}

export interface PhotographerPortfolioItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  featured: boolean;
}

export interface PhotographerAvailability {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface PhotographerDetail {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_image_url: string;
  bio: string;
  average_rating: number;
  total_reviews: number;
  services: PhotographerService[];
  portfolio: PhotographerPortfolioItem[];
  availability: PhotographerAvailability[];
}

export interface PhotographerDetailResponse {
  photographer: PhotographerDetail;
}

export interface PhotographerServicePayload {
  title: string;
  description: string;
  service_type: string;
  base_price: number;
  duration_hours: number;
  equipment_included: string[];
}

export interface PhotographerServiceUpdatePayload {
  service_id: string;
  title: string;
  description: string;
  service_type: string;
  base_price: number;
  duration_hours: number;
  equipment_included: string[];
  active: boolean;
}

export interface PhotographerServiceItem {
  id: string;
  title: string;
  description: string;
  service_type: string;
  base_price: number;
  duration_hours: number;
  equipment_included: string[];
  active: boolean;
  photographer_id: string;
  created_at: string;
}

export interface PhotographerServiceResponse {
  message: string;
  service: PhotographerServiceItem;
}

export interface PhotographerServiceListResponse {
  services: PhotographerServiceItem[];
}

export interface photographer {
  id: string;
  owner_id: string;
  name: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
}

export interface photographerCreateResponse {
  photographer: photographer;
  message: string;
}

export interface photographerReview {
  id: string;
  rating: number;
  comment: string;
  created_at?: string;
  customers?: { full_name?: string };
}

export interface photographerReviewCreateResponse {
  message: string;
  review: photographerReview;
}

export interface PhotographerProfileResponse {
  photographer: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    profile_image_url: string;
    bio: string;
    average_rating: number;
    total_reviews: number;
    services: PhotographerService[];
    portfolio: PhotographerPortfolioItem[];
    availability: PhotographerAvailability[];
  };
}

export interface PortfolioItem {
  id: string;
  photographer_id: string;
  title: string;
  image_url: string;
  created_at: string;
}

export interface PhotographerPortfolioUploadResponse {
  message: string;
  portfolio_item: PortfolioItem;
}

export interface PhotographerPortfolioUploadPayload {
  title: string;
  description: string;
  image_url: string;
  category: string;
  featured: boolean;
}