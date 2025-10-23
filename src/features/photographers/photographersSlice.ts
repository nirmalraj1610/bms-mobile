import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { photographersState } from './photographers.types';
import { searchphotographers, fetchphotographerDetail, fetchPhotographerServices, fetchPhotographerAvailability, createReview as createReviewApi , createphotographer } from './photographers.service';

const initialState: photographersState = {
  search: { items: [], total: 0, loading: false, error: null },
  detail: { photographer: null, loading: false, error: null },
  services: { items: [], loading: false, error: null },
  availability: { date: undefined, timeSlots: [], loading: false, error: null },
  review: { submitting: false, error: null },
  create: {
    loading: false,
    error: null,
    photographer: null,
  },
};

export const getphotographersSearch = createAsyncThunk(
  'photographers/search',
  async (query: Record<string, string | number | boolean> | undefined, { rejectWithValue }) => {
    try {
      const res = await searchphotographers(query);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.error || 'Failed to load photographers');
    }
  }
);

export const getphotographerDetail = createAsyncThunk(
  'photographers/detail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchphotographerDetail(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photographer details');
    }
  }
);

export const getPhotographerServices = createAsyncThunk(
  'photographers/services',
  async (photographerId: string, { rejectWithValue }) => {
    try {
      return await fetchPhotographerServices(photographerId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photographer services');
    }
  }
);

export const getPhotographerAvailability = createAsyncThunk(
  'photographers/availability',
  async ({ id, date }: { id: string; date?: string }, { rejectWithValue }) => {
    try {
      return await fetchPhotographerAvailability(id, date);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photographer availability');
    }
  }
);

export const createReview = createAsyncThunk(
  'photographers/createReview',
  async (payload: { booking_id: string; photographer_id: string; rating: number; comment?: string }, { rejectWithValue }) => {
    try {
      const res = await createReviewApi(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.error || 'Failed to submit review');
    }
  }
);

export const createphotographers = createAsyncThunk(
  'photographers/create',
  async (payload: {
  name: string;
  description: string;
  location: object; 
  pricing: object;  
  amenities: string[];
}, { rejectWithValue }) => {
    try {
      const res = await createphotographer(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.error || 'Failed to create photographer');
    }
  }
);

const photographersSlice = createSlice({
  name: 'photographers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(getphotographersSearch.pending, (state) => {
        state.search.loading = true;
        state.search.error = null;
      })
      .addCase(getphotographersSearch.fulfilled, (state, action) => {
        state.search.loading = false;
        state.search.items = (action.payload.photographers || []).map((p: any) => ({
          ...p,
          profile_image_url: p.profile_image_url || '',
          services: p.services || [],
        }));
        state.search.total = action.payload.total || 0;
      })
      .addCase(getphotographersSearch.rejected, (state, action) => {
        state.search.loading = false;
        state.search.error = (action.payload as string) || 'Failed to load photographers';
      })
      // Detail
      .addCase(getphotographerDetail.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(getphotographerDetail.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.photographer = action.payload.photographer || null;
      })
      .addCase(getphotographerDetail.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = (action.payload as string) || 'Failed to load photographer details';
      })
      // Review
      .addCase(createReview.pending, (state) => {
        state.review.submitting = true;
        state.review.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.review.submitting = false;
        const newReview = action.payload?.review;
        if (newReview && state.detail.photographer) {
          const existing = state.detail.photographer.total_reviews  || [];
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.review.submitting = false;
        state.review.error = (action.payload as string) || 'Failed to submit review';
      })
      // Create
      .addCase(createphotographers.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
        state.create.photographer = null;
      })
      .addCase(createphotographers.fulfilled, (state, action) => {
        state.create.loading = false;
        state.create.photographer = action.payload;
      })
      .addCase(createphotographers.rejected, (state, action) => {
        state.create.loading = false;
        state.create.error = (action.payload as string) || 'Failed to create photographer';
      })
      // Services
      .addCase(getPhotographerServices.pending, (state) => {
        state.services.loading = true;
        state.services.error = null;
      })
      .addCase(getPhotographerServices.fulfilled, (state, action) => {
        state.services.loading = false;
        state.services.items = action.payload?.services || [];
      })
      .addCase(getPhotographerServices.rejected, (state, action) => {
        state.services.loading = false;
        state.services.error = (action.payload as string) || 'Failed to load photographer services';
      })
      // Availability
      .addCase(getPhotographerAvailability.pending, (state) => {
        state.availability.loading = true;
        state.availability.error = null;
      })
      .addCase(getPhotographerAvailability.fulfilled, (state, action) => {
        state.availability.loading = false;
        state.availability.timeSlots = action.payload?.timeSlots || [];
        state.availability.date = action.payload?.date;
      })
      .addCase(getPhotographerAvailability.rejected, (state, action) => {
        state.availability.loading = false;
        state.availability.error = (action.payload as string) || 'Failed to load photographer availability';
      });
  },
});

export default photographersSlice.reducer;