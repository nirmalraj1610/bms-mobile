import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  StudiosState,
  StudiosSearchQuery,
  AvailabilityPayload,
  ReviewCreatePayload,
  StudioCreatePayload,
  ToggleFavoritePayload,
} from './studios.types';
import {
  searchStudios,
  getStudioDetails,
  getStudioAvailability,
  getStudioEquipment,
  toggleFavoriteStudio,
  getFavoriteStudios,
  createStudioReview,
  createStudio,
} from './studios.service';

const initialState: StudiosState = {
  search: { loading: false, error: null, results: [], query: '' },
  detail: { loading: false, error: null, data: null },
  availability: { loading: false, error: null, booking_slots: [], studio_id: undefined, date: undefined, bookings: [] },
  favorites: { loading: false, error: null, items: [] },
  reviewCreate: { loading: false, error: null, success: false },
  studioCreate: { loading: false, error: null, created_id: null },
  equipment: { loading: false, error: null, equipment: [] },
};

export const studiosSearchThunk = createAsyncThunk('studios/search', async (query: StudiosSearchQuery, { rejectWithValue }) => {
  try {
    const res = await searchStudios(query);
    return { results: res.studios || [], query: query.q || '' };
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to search studios');
  }
});

export const studioDetailsThunk = createAsyncThunk('studios/details', async (id: string, { rejectWithValue }) => {
  try {
    console.log('=== studioDetailsThunk Debug ===');
    console.log('Fetching studio details for ID:', id);
    console.log('ID type:', typeof id);
    
    const res = await getStudioDetails(id);
    console.log('API response:', res);
    console.log('API response type:', typeof res);
    console.log('API response keys:', res ? Object.keys(res) : 'null');
    console.log('res.studio:', res.studio);
    
    const studioData = res.studio || null;
    console.log('Returning studio data:', studioData);
    
    return studioData;
  } catch (err: any) {
    console.error('studioDetailsThunk error:', err);
    console.error('Error type:', typeof err);
    console.error('Error keys:', err ? Object.keys(err) : 'null');
    return rejectWithValue(err?.error || 'Failed to load studio details');
  }
});

export const studioAvailabilityThunk = createAsyncThunk('studios/availability', async (payload: AvailabilityPayload, { rejectWithValue }) => {
  try {
    const res = await getStudioAvailability(payload);
    return res;
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to load availability');
  }
});

export const toggleFavoriteThunk = createAsyncThunk('studios/toggleFavorite', async (payload: ToggleFavoritePayload, { rejectWithValue, getState }) => {
  try {
    const res = await toggleFavoriteStudio(payload);
    const result = { ...res, studio_id: payload.studio_id, action: payload.action };
    return result;
  } catch (err: any) {
    // Handle duplicate key constraint error
    if (err?.error?.includes('duplicate key value violates unique constraint') || err?.error?.includes('studio_favorites_customer_id_studio_id_key')) {
      // If it's a duplicate error and we were trying to add, treat it as success
      if (payload.action === 'add') {
        return { message: 'Already favorited', studio_id: payload.studio_id, action: payload.action };
      }
    }
    
    return rejectWithValue(err?.error || 'Failed to toggle favorite');
  }
});

export const loadFavoritesThunk = createAsyncThunk('studios/loadFavorites', async (_, { rejectWithValue }) => {
  try {
    console.log('=== loadFavoritesThunk Debug ===');
    console.log('Calling getFavoriteStudios API...');
    const res = await getFavoriteStudios();
    console.log('API Response:', res);
    const favorites = res.favorites || [];
    console.log('Extracted favorites:', favorites);
    console.log('Favorites count:', favorites.length);
    return favorites;
  } catch (err: any) {
    console.log('loadFavoritesThunk Error:', err);
    
    // Handle authentication errors gracefully
    if (err?.status === 401 || err?.error?.includes('unauthorized') || err?.error?.includes('authentication')) {
      console.log('Authentication error detected, user not logged in');
      // Return empty array instead of rejecting for auth errors
      return [];
    }
    
    return rejectWithValue(err?.error || 'Failed to load favorites');
  }
});

export const createReviewThunk = createAsyncThunk('studios/createReview', async (payload: ReviewCreatePayload, { rejectWithValue }) => {
  try {
    const res = await createStudioReview(payload);
    return res.review || null;
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to create review');
  }
});

export const createStudioThunk = createAsyncThunk('studios/createStudio', async (payload: StudioCreatePayload, { rejectWithValue }) => {
  try {
    const res = await createStudio(payload);
    return res.studio?.id || null;
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to create studio');
  }
});

export const getStudioEquipmentThunk = createAsyncThunk(
  'studios/getEquipment', 
  async (payload: { studio_id: string; available_only?: boolean }, { rejectWithValue }) => {
    try {
      console.log('🔧 getStudioEquipmentThunk called with payload:', payload);
      
      const res = await getStudioEquipment(payload.studio_id, payload.available_only);
      console.log('📡 API response received:', res);
      
      // The API returns { equipment: [...] } according to the provided format
      const equipmentData = res.equipment || [];
      console.log('✅ Equipment data extracted:', equipmentData);
      
      return equipmentData;
    } catch (err: any) {
      console.error('❌ getStudioEquipmentThunk error:', err);
      return rejectWithValue(err?.error || 'Failed to load studio equipment');
    }
  }
);

const studiosSlice = createSlice({
  name: 'studios',
  initialState,
  reducers: {
    clearStudioDetail(state) {
      state.detail.data = null;
      state.detail.error = null;
    },
    resetReviewCreate(state) {
      state.reviewCreate.success = false;
      state.reviewCreate.error = null;
    },
    resetStudioCreate(state) {
      state.studioCreate.created_id = null;
      state.studioCreate.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(studiosSearchThunk.pending, (state) => {
        state.search.loading = true;
        state.search.error = null;
      })
      .addCase(studiosSearchThunk.fulfilled, (state, action) => {
        state.search.loading = false;
        state.search.results = action.payload.results;
        state.search.query = action.payload.query;
      })
      .addCase(studiosSearchThunk.rejected, (state, action) => {
        state.search.loading = false;
        state.search.error = (action.payload as string) || action.error.message || 'Search failed';
      })
      .addCase(studioDetailsThunk.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(studioDetailsThunk.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.data = action.payload;
      })
      .addCase(studioDetailsThunk.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = (action.payload as string) || action.error.message || 'Failed to load details';
      })
      .addCase(studioAvailabilityThunk.pending, (state) => {
        state.availability.loading = true;
        state.availability.error = null;
      })
      .addCase(studioAvailabilityThunk.fulfilled, (state, action) => {
        state.availability.loading = false;
        const data = action.payload as any;
        state.availability.booking_slots = data?.booking_slots || [];
        state.availability.studio_id = data?.studio_id;
        state.availability.date = data?.date;
        state.availability.bookings = data?.bookings || [];
      })
      .addCase(studioAvailabilityThunk.rejected, (state, action) => {
        state.availability.loading = false;
        state.availability.error = (action.payload as string) || action.error.message || 'Failed to load availability';
      })
      .addCase(toggleFavoriteThunk.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
        state.favorites.loading = false;
        const { studio_id, action: actionType } = action.payload;
        
        if (actionType === 'add') {
          // Only add if not already in favorites
          const isAlreadyFavorite = state.favorites.items.some(fav => (fav as any).studio_id === studio_id);
          if (!isAlreadyFavorite) {
            // Create a favorite record in the same format as the API
            const favoriteRecord = {
              id: `temp-${Date.now()}`, // Temporary ID until we reload from API
              studio_id: studio_id,
              customer_id: 'current-user' // This will be updated when we reload from API
            };
            state.favorites.items.push(favoriteRecord as any);
          }
        } else if (actionType === 'remove') {
          state.favorites.items = state.favorites.items.filter((fav: any) => (fav as any).studio_id !== studio_id);
        }
      })
      .addCase(toggleFavoriteThunk.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = (action.payload as string) || action.error.message || 'Failed to toggle favorite';
      })
      .addCase(loadFavoritesThunk.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(loadFavoritesThunk.fulfilled, (state, action) => {
        state.favorites.loading = false;
        console.log('=== loadFavoritesThunk.fulfilled Debug ===');
        console.log('Payload received:', action.payload);
        console.log('Setting favorites.items to:', action.payload);
        state.favorites.items = action.payload;
        console.log('Updated favorites state:', state.favorites.items);
      })
      .addCase(loadFavoritesThunk.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = (action.payload as string) || action.error.message || 'Failed to load favorites';
      })
      .addCase(createReviewThunk.pending, (state) => {
        state.reviewCreate.loading = true;
        state.reviewCreate.error = null;
        state.reviewCreate.success = false;
      })
      .addCase(createReviewThunk.fulfilled, (state) => {
        state.reviewCreate.loading = false;
        state.reviewCreate.success = true;
      })
      .addCase(createReviewThunk.rejected, (state, action) => {
        state.reviewCreate.loading = false;
        state.reviewCreate.error = (action.payload as string) || action.error.message || 'Failed to create review';
      })
      .addCase(createStudioThunk.pending, (state) => {
        state.studioCreate.loading = true;
        state.studioCreate.error = null;
        state.studioCreate.created_id = null;
      })
      .addCase(createStudioThunk.fulfilled, (state, action) => {
        state.studioCreate.loading = false;
        state.studioCreate.created_id = action.payload || null;
      })
      .addCase(createStudioThunk.rejected, (state, action) => {
        state.studioCreate.loading = false;
        state.studioCreate.error = (action.payload as string) || action.error.message || 'Failed to create studio';
      })
      .addCase(getStudioEquipmentThunk.pending, (state) => {
        state.equipment.loading = true;
        state.equipment.error = null;
      })
      .addCase(getStudioEquipmentThunk.fulfilled, (state, action) => {
        state.equipment.loading = false;
        state.equipment.equipment = action.payload;
      })
      .addCase(getStudioEquipmentThunk.rejected, (state, action) => {
        state.equipment.loading = false;
        state.equipment.error = (action.payload as string) || action.error.message || 'Failed to load equipment';
      });
  },
});

export const { clearStudioDetail, resetReviewCreate, resetStudioCreate } = studiosSlice.actions;
export default studiosSlice.reducer;