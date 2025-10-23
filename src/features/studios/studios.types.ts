import type { StudioSummary, StudioDetail, AvailabilityBookingSlot } from '../../types/api';

export type StudiosState = {
  [x: string]: any;
  search: {
    loading: boolean;
    error: string | null;
    results: StudioSummary[];
    query: string;
  };
  detail: {
    loading: boolean;
    error: string | null;
    data: StudioDetail | null;
  };
  availability: {
    loading: boolean;
    error: string | null;
    booking_slots: { start_time: string; end_time: string; is_booked: boolean }[];
    studio_id?: string;
    date?: string;
    bookings: AvailabilityBookingSlot[];
  };
  favorites: {
    loading: boolean;
    error: string | null;
    items: StudioSummary[];
  };
  reviewCreate: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
  studioCreate: {
    loading: boolean;
    error: string | null;
    created_id: string | null;
  };
};

export type StudiosSearchQuery = {
  city?: string;
  q?: string;
  features?: string[];
  types?: string[];
  page?: number;
  limit?: number;
};

export type ToggleFavoritePayload = {
  studio_id: string;
  action: 'add' | 'remove';
};

export type AvailabilityPayload = {
  studio_id: string;
  date?: string;
};

export type ReviewCreatePayload = {
  booking_id: string;
  studio_id: string;
  rating: number;
  comment?: string;
};

export type StudioCreatePayload = {
  name: string;
  description: string;
  location: Record<string, any>;
  pricing: Record<string, any>;
  amenities: string[];
};