import { 
  photographersSearch, 
  photographerDetail, 
  photographerReviewCreate, 
  photographerCreate, 
  photographerServices, 
  photographerAvailability 
} from '../../lib/api';

export const searchphotographers = async (query?: Record<string, string | number | boolean>) => {
  return photographersSearch(query);
};

export const fetchphotographerDetail = async (id: string) => {
  return photographerDetail(id);
};

export const fetchPhotographerServices = async (photographerId: string) => {
  return photographerServices(photographerId);
};

export const fetchPhotographerAvailability = async (id: string, date?: string) => {
  try {
    return await photographerAvailability(id, date);
  } catch (error: any) {
    // If the API endpoint doesn't exist (404), return mock data
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      console.warn('Photographer availability API not implemented, using mock data');
      return {
        success: true,
        date: date || new Date().toISOString().split('T')[0],
        timeSlots: [
          { time: '09:00', available: true, price: 150 },
          { time: '10:00', available: true, price: 150 },
          { time: '11:00', available: false, price: 150 },
          { time: '12:00', available: true, price: 150 },
          { time: '13:00', available: true, price: 150 },
          { time: '14:00', available: true, price: 150 },
          { time: '15:00', available: false, price: 150 },
          { time: '16:00', available: true, price: 150 },
          { time: '17:00', available: true, price: 150 },
          { time: '18:00', available: true, price: 150 }
        ]
      };
    }
    throw error;
  }
};

export const createReview = async (payload: { booking_id: string; photographer_id: string; rating: number; comment?: string }) => {
  return photographerReviewCreate(payload);
};

export const createphotographer = async (payload: {
  name: string;
  description: string;
  location: object; 
  pricing: object;  
  amenities: string[];
}) => {
  return photographerCreate(payload);
};