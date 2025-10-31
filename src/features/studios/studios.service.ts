import { studiosSearch, studioDetail, studioAvailability, studioEquipmentList, studioFavorite, studioFavorites, reviewCreate, StudioCreate, myStudios, studiosBookings } from '../../lib/api';
import type { StudiosSearchQuery, AvailabilityPayload, ReviewCreatePayload, StudioCreatePayload, ToggleFavoritePayload } from './studios.types';

export const searchStudios = async (query: StudiosSearchQuery) => {
  const normalized: Record<string, string | number | boolean> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      normalized[key] = value.join(',');
    } else if (value !== undefined && value !== null) {
      normalized[key] = value as any;
    }
  });
  return studiosSearch(normalized);
};

export const getStudioDetails = async (id: string) => {
  console.log('=== getStudioDetails Debug ===');
  console.log('Calling studioDetail API with ID:', id);
  
  const result = await studioDetail(id);
  console.log('studioDetail API result:', result);
  
  return result;
};

export const getStudioAvailability = async (payload: AvailabilityPayload) => {
  return studioAvailability(payload.studio_id, payload.date);
};

export const toggleFavoriteStudio = async (payload: ToggleFavoritePayload) => {
  return studioFavorite({ studio_id: payload.studio_id, action: payload.action });
};

export const getFavoriteStudios = async () => {
  return studioFavorites();
};

export const createStudioReview = async (payload: ReviewCreatePayload) => {
  return reviewCreate(payload);
};

export const createStudio = async (payload: StudioCreatePayload) => {
  return StudioCreate(payload);
};

// ✅ 2️⃣ Wrapper function
export const getMyStudios = async (params?: { status?: string; include_stats?: boolean }) => {
  return myStudios(params);
};

// ✅ 2️⃣ Wrapper Function
export const getStudiosBookings = async (params: {
  studio_id: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}) => {
  return studiosBookings(params);
};


export const getStudioEquipment = async (studio_id: string, available_only?: boolean) => {
  return studioEquipmentList(studio_id, available_only);
};