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
  toggleFavoriteStudio,
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
    const res = await getStudioDetails(id);
    return res.studio || null;
  } catch (err: any) {
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

export const toggleFavoriteThunk = createAsyncThunk('studios/toggleFavorite', async (payload: ToggleFavoritePayload, { rejectWithValue }) => {
  try {
    const res = await toggleFavoriteStudio(payload);
    return { ...res, studio_id: payload.studio_id, action: payload.action };
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to toggle favorite');
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
        const studioId: string = (action.payload as any)?.studio_id;
        const actionType: 'add' | 'remove' = (action.payload as any)?.action;
        const setFav = actionType === 'add';
        if (setFav) {
          const fromDetail = state.detail.data
            ? {
                id: state.detail.data.id,
                name: state.detail.data.name,
                location: { city: state.detail.data.location?.city },
                average_rating: state.detail.data.average_rating,
              }
            : undefined;
          const exists = state.favorites.items.find((s) => s.id === studioId);
          if (!exists && fromDetail) {
            state.favorites.items.push(fromDetail as any);
          }
        } else {
          state.favorites.items = state.favorites.items.filter((s) => s.id !== studioId);
        }
      })
      .addCase(toggleFavoriteThunk.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = (action.payload as string) || action.error.message || 'Failed to toggle favorite';
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
      });
  },
});

export const { clearStudioDetail, resetReviewCreate, resetStudioCreate } = studiosSlice.actions;
export default studiosSlice.reducer;