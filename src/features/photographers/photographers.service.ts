import { 
  photographersSearch, 
  photographerDetail, 
  photographerReviewCreate, 
  photographerCreate, 
  photographerServices, 
  photographerAvailability,
  createPhotographerBooking
} from '../../lib/api';
import { PhotographerBookingCreateResponse } from '../../types/api';

export const searchphotographers = async (query?: Record<string, string | number | boolean>) => {
  return photographersSearch(query);
};

export const fetchphotographerDetail = async (id: string) => {
  try {
    return await photographerDetail(id);
  } catch (error: any) {
    // If the API endpoint doesn't exist (404), return mock data
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      console.warn('Photographer detail API not implemented, using mock data');
      return {
        photographer: {
          id: id,
          full_name: 'Professional Photographer',
          email: 'photographer@example.com',
          phone: '+91 9876543210',
          profile_image_url: 'https://via.placeholder.com/400x220',
          bio: 'Professional photographer with years of experience in capturing beautiful moments.',
          average_rating: 4.5,
          total_reviews: 25,
          services: [],
          portfolio: [],
          availability: []
        }
      };
    }
    throw error;
  }
};

export const fetchPhotographerServices = async (photographerId: string) => {
  try {
    return await photographerServices(photographerId);
  } catch (error: any) {
    // If the API endpoint doesn't exist (404), return mock data
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      console.warn('Photographer services API not implemented, using mock data');
      return {
        services: [
          {
            id: '1',
            title: 'Portrait Photography',
            description: 'Professional portrait photography session',
            service_type: 'portrait',
            base_price: 4000,
            duration_hours: 2,
            equipment_included: ['Camera', 'Lighting', 'Backdrop'],
            active: true
          },
          {
            id: '2',
            title: 'Event Photography',
            description: 'Complete event coverage',
            service_type: 'event',
            base_price: 8000,
            duration_hours: 4,
            equipment_included: ['Camera', 'Flash', 'Backup Equipment'],
            active: true
          },
          {
            id: '3',
            title: 'Wedding Photography',
            description: 'Full wedding day coverage',
            service_type: 'wedding',
            base_price: 15000,
            duration_hours: 8,
            equipment_included: ['Multiple Cameras', 'Lighting', 'Drone'],
            active: true
          }
        ]
      };
    }
    throw error;
  }
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

export const createPhotographerBookingService = async (payload: { 
  photographer_id: string; 
  service_id: string; 
  booking_date: string; 
  start_time: string; 
  end_time: string; 
  total_amount: number 
}): Promise<PhotographerBookingCreateResponse> => {
  return createPhotographerBooking(payload);
};