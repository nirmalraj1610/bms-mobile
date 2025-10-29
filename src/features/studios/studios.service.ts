import { studiosSearch, studioDetail, studioAvailability, studioFavorite, studioFavorites, reviewCreate, StudioCreate } from '../../lib/api';
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