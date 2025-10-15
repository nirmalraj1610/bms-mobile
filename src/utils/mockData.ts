import { Studio, StudioType, Equipment, Review } from '../types';

export const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Canon EOS R5',
    category: 'camera',
    description: 'Professional mirrorless camera',
  },
  {
    id: '2',
    name: 'Profoto D2 1000W',
    category: 'lighting',
    description: 'Professional studio strobe',
  },
  {
    id: '3',
    name: 'Softbox 80x80cm',
    category: 'lighting',
    description: 'Large softbox for portrait lighting',
  },
  {
    id: '4',
    name: 'Backdrop Stand',
    category: 'props',
    description: 'Adjustable backdrop stand system',
  },
];

export const mockStudioTypes: StudioType[] = [
  { id: '1', name: 'Portrait Studio', icon: '👤' },
  { id: '2', name: 'Product Photography', icon: '📦' },
  { id: '3', name: 'Fashion Studio', icon: '👗' },
  { id: '4', name: 'Wedding Studio', icon: '💒' },
  { id: '5', name: 'Commercial Studio', icon: '🏢' },
];

export const mockStudios: Studio[] = [
  {
    id: '1',
    name: 'Mumbai Studio Pro',
    description: 'Premium photography studio in the heart of Mumbai with state-of-the-art equipment and professional lighting setup.',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Bandra West, Mumbai, Maharashtra',
      coordinates: {
        latitude: 19.0544,
        longitude: 72.8328,
      },
    },
    type: mockStudioTypes[0],
    images: [
      'https://images.unsplash.com/photo-1554306274-f23873d9a26c?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    amenities: ['Air Conditioning', 'WiFi', 'Parking', 'Green Room', 'Makeup Room'],
    equipment: mockEquipment,
    pricing: {
      hourlyRate: 2500,
      halfDayRate: 10000,
      fullDayRate: 18000,
    },
    availability: [],
    rating: 2.8,
    reviewCount: 127,
    verified: true,
    owner: {
      name: 'Rajesh Sharma',
      contact: '+91 98765 43210',
    },
  },
  {
    id: '2',
    name: 'Delhi Fashion Hub',
    description: 'Spacious fashion studio with natural lighting and modern equipment for fashion and commercial shoots.',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      address: 'Connaught Place, New Delhi',
      coordinates: {
        latitude: 28.6273,
        longitude: 77.2194,
      },
    },
    type: mockStudioTypes[2],
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1554306274-f23873d9a26c?w=800',
    ],
    amenities: ['Natural Light', 'WiFi', 'Parking', 'Wardrobe', 'Catering'],
    equipment: mockEquipment.slice(0, 3),
    pricing: {
      hourlyRate: 3000,
      halfDayRate: 12000,
      fullDayRate: 22000,
    },
    availability: [],
    rating: 3.6,
    reviewCount: 89,
    verified: true,
    owner: {
      name: 'Priya Gupta',
      contact: '+91 87654 32109',
    },
  },
  {
    id: '3',
    name: 'Bangalore Product Studio',
    description: 'Specialized product photography studio with precise lighting control and multiple backdrop options.',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Koramangala, Bangalore',
      coordinates: {
        latitude: 12.9279,
        longitude: 77.6271,
      },
    },
    type: mockStudioTypes[1],
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
      'https://images.unsplash.com/photo-1554306274-f23873d9a26c?w=800',
    ],
    amenities: ['Precise Lighting', 'WiFi', 'Product Tables', 'Multiple Backdrops'],
    equipment: [mockEquipment[0], mockEquipment[1], mockEquipment[3]],
    pricing: {
      hourlyRate: 2000,
      halfDayRate: 8000,
      fullDayRate: 15000,
    },
    availability: [],
    rating: 1.9,
    reviewCount: 156,
    verified: true,
    owner: {
      name: 'Arjun Reddy',
      contact: '+91 76543 21098',
    },
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    studioId: '1',
    userId: '1',
    userName: 'Amit Patel',
    rating: 5,
    comment: 'Excellent studio with professional equipment. The owner was very helpful and accommodating.',
    createdAt: new Date('2024-01-15'),
    images: ['https://images.unsplash.com/photo-1554306274-f23873d9a26c?w=400'],
  },
  {
    id: '2',
    studioId: '1',
    userId: '2',
    userName: 'Sneha Joshi',
    rating: 4,
    comment: 'Great lighting setup and clean studio. Would definitely book again for future shoots.',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    studioId: '2',
    userId: '3',
    userName: 'Rahul Kumar',
    rating: 5,
    comment: 'Perfect for fashion shoots. Natural lighting is amazing and the space is huge.',
    createdAt: new Date('2024-01-22'),
  },
];

// Favorites-specific mock studios to mirror the Figma design
export const mockFavoriteStudios: Studio[] = [
  {
    id: 'rez-photography',
    name: 'Rez Photography',
    description:
      "We believe photography isn't just about pictures — it's about capturing emotions, memories, and the art in every moment.",
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Rez Studio, Pune',
      coordinates: { latitude: 18.5204, longitude: 73.8567 },
    },
    type: { id: 'portrait', name: 'Portrait Studio', icon: '👤' },
    images: [
      'https://images.unsplash.com/photo-1554306274-f23873d9a26c?w=1200&auto=format&fit=crop',
    ],
    amenities: ['Air Conditioning', 'WiFi', 'Parking', 'Green Room'],
    equipment: [
      { id: 'e1', name: 'Godox VL300 Light', category: 'lighting' },
      { id: 'e2', name: 'Large Octbox', category: 'lighting' },
      { id: 'e3', name: 'Seamless Backdrops(white, Grey, Black)', category: 'props' },
    ],
    pricing: { hourlyRate: 1880, halfDayRate: 8000, fullDayRate: 15000 },
    availability: [],
    rating: 4.8,
    reviewCount: 289,
    verified: true,
    owner: { name: 'Rez Studio', contact: '+91 98765 43210' },
  },
  {
    id: 'mk-studioz',
    name: 'Mk Studioz',
    description:
      'Modern studio with professional lighting, ideal for portraits and fashion shoots.',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Andheri West, Mumbai',
      coordinates: { latitude: 19.1197, longitude: 72.8468 },
    },
    type: { id: 'fashion', name: 'Fashion Studio', icon: '👗' },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop',
    ],
    amenities: ['WiFi', 'Parking', 'Wardrobe'],
    equipment: [
      { id: 'e4', name: 'Profoto D2 1000W', category: 'lighting' },
      { id: 'e5', name: 'Softbox 80x80cm', category: 'lighting' },
    ],
    pricing: { hourlyRate: 2200, halfDayRate: 9000, fullDayRate: 16000 },
    availability: [],
    rating: 4.8,
    reviewCount: 268,
    verified: true,
    owner: { name: 'Mk Studioz', contact: '+91 99876 54321' },
  },
  {
    id: 'jd-capture',
    name: 'JD Capture',
    description:
      'Creative studio space perfect for portraits, product shoots, and content creation.',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Banjara Hills, Hyderabad',
      coordinates: { latitude: 17.4126, longitude: 78.4381 },
    },
    type: { id: 'product', name: 'Product Photography', icon: '📦' },
    images: [
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1200&auto=format&fit=crop',
    ],
    amenities: ['WiFi', 'Parking'],
    equipment: [
      { id: 'e6', name: 'Backdrop Stand', category: 'props' },
      { id: 'e7', name: 'LED Panels', category: 'lighting' },
    ],
    pricing: { hourlyRate: 2000, halfDayRate: 7800, fullDayRate: 14000 },
    availability: [],
    rating: 4.7,
    reviewCount: 195,
    verified: true,
    owner: { name: 'JD Capture', contact: '+91 91234 56789' },
  },
];