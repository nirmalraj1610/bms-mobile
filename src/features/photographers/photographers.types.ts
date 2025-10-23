import type {
  PhotographerSearchResult,
  PhotographerDetail,
  Review,
  photographerCreateResponse,
  PhotographerServiceListResponse,
} from '../../types/api';

export type photographersSearchQuery = Record<string, string | number | boolean>;

export type FavoriteItem = { id?: string; photographer_id?: string } & Record<string, any>;

export type photographersState = {
  [x: string]: any;
  search: { items: PhotographerSearchResult[]; total: number; loading: boolean; error: string | null };
  detail: { photographer: PhotographerDetail | null; loading: boolean; error: string | null };
  services: {
    [x: string]: any; items: any[]; loading: boolean; error: string | null 
};
  availability: { date?: string; timeSlots: any[]; loading: boolean; error: string | null };
  review: { submitting: boolean; error: string | null };
  create: {
    loading: boolean;
    error: string | null;
    photographer: photographerCreateResponse | null;
  };
};

export type ToggleFavoritePayload = { photographer_id: string; action: 'add' | 'remove' };
export type ReviewCreatePayload = { booking_id: string; photographer_id: string; rating: number; comment?: string };