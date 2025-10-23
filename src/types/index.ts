export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  joinedDate: Date;
}

export interface Studio {
  id: string;
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  type: StudioType;
  images: string[];
  amenities: string[];
  equipment: Equipment[];
  pricing: {
    [x: string]: number;
    hourlyRate: number;
    halfDayRate: number;
    fullDayRate: number;
  };
  availability: TimeSlot[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  owner: {
    name: string;
    contact: string;
  };
}

export interface StudioType {
  id: string;
  name: string;
  icon: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'camera' | 'lighting' | 'props' | 'other';
  description?: string;
}

export interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
}

export interface Booking {
  id: string;
  studioId: string;
  studio: Studio;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  notes?: string;
}

export interface Review {
  id: string;
  studioId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  images?: string[];
}

export interface SearchFilters {
  city?: string;
  studioType?: string;
  date?: Date;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  rating?: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type RootStackParamList = {
  Splash: undefined;
  GettingStarted: undefined;
  Auth: undefined;
  Main: undefined;
  StudioDetails: { studioId: string };
  PhotographerDetails: { photographerId: string };
  Booking: { studioId: string };
  BookingConfirmation: { bookingId: string };
  OurWorks: undefined;
  Gallery: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};