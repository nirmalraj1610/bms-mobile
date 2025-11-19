import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { photographersState } from './photographers.types';
import { searchphotographers, fetchphotographerDetail, fetchPhotographerServices, fetchPhotographerAvailability, createReview as createReviewApi, createphotographer, createPhotographerBookingService, getPhotographerBookings } from './photographers.service';
import { createPhotographerPortfolioApi, getPhotographerProfileApi, getPhotographerTimeSlotsApi, postPhotographerService, updatePhotographerServiceApi, updateTimeSlots } from '../../lib/api';
import { PhotographerPortfolioUploadPayload, PhotographerServicePayload, PhotographerServiceUpdatePayload, UpdateTimeSlotsPayload } from '../../types/api';

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
  booking: {
    loading: false,
    error: null,
    success: false,
  },
};

export const getphotographersSearch = createAsyncThunk(
  'photographers/search',
  async (query: Record<string, string | number | boolean> | undefined, { rejectWithValue }) => {
    try {
      const res = await searchphotographers(query);
      return { photographers: res.photographers || [], total: res.total || 0, append: ((query?.page as number) ?? 1) > 1 };
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

export const getPhotographerPortfolio = createAsyncThunk(
  'photographers/portfolio',
  async (photographerId: string, { rejectWithValue }) => {
    try {
      return await getPhotographerProfileApi(photographerId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photographer portfolio');
    }
  }
);

export const createPhotographerPortfolio = createAsyncThunk(
  'photographers/portfolio/create',
  async (payload: PhotographerPortfolioUploadPayload, { rejectWithValue }) => {
    try {
      return await createPhotographerPortfolioApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create photographer portfolio');
    }
  }
);

export const managePhotographerTimeSlots = createAsyncThunk(
  'photographers/timeslots/update',
  async (payload: UpdateTimeSlotsPayload, { rejectWithValue }) => {
    try {
      return await updateTimeSlots(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update photographer time slots');
    }
  }
);

export const getPhotographerTimeSlots = createAsyncThunk(
  'photographers/timeslots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPhotographerTimeSlotsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photographer time slots');
    }
  }
);

export const createPhotographerServices = createAsyncThunk(
  'photographers/services/create',
  async (payload: PhotographerServicePayload, { rejectWithValue }) => {
    try {
      return await postPhotographerService(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create photographer services');
    }
  }
);

export const updatePhotographerServices = createAsyncThunk(
  'photographers/services/update',
  async (payload: PhotographerServiceUpdatePayload, { rejectWithValue }) => {
    try {
      return await updatePhotographerServiceApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create photographer services');
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


// ✅ 3️⃣ Thunk with optional params
export const loadPhotographerBookingsThunk = createAsyncThunk(
  "photographer-bookings",
  async (params: {
    status?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }, { rejectWithValue }) => {
    try {
      const res = await getPhotographerBookings(params);
      console.log("API Response:", res);
      const bookings = res.bookings || [];
      return bookings;
    } catch (err: any) {
      console.log("loadPhotographerBookingsThunk Error:", err);

      // Handle authentication errors gracefully
      if (
        err?.status === 401 ||
        err?.error?.includes("unauthorized") ||
        err?.error?.includes("authentication")
      ) {
        console.log("Authentication error detected, user not logged in");
        return [];
      }

      return rejectWithValue(err?.error || "Failed to load photographer bookings");
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

export const createPhotographerBooking = createAsyncThunk(
  'booking-photographer',
  async (payload: {
    photographer_id: string;
    service_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_amount: number
  }, { rejectWithValue }) => {
    try {
      const res = await createPhotographerBookingService(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.error || 'Failed to create photographer booking');
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
        const incoming = (action.payload.photographers || []).map((p: any) => ({
          ...p,
          profile_image_url: p.profile_image_url || '',
          services: p.services || [],
        }));
        const append = (action.payload as any)?.append;
        state.search.items = append ? [...state.search.items, ...incoming] : incoming;
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
          const existing = state.detail.photographer.total_reviews || [];
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
      })
      // Booking
      .addCase(createPhotographerBooking.pending, (state) => {
        state.booking.loading = true;
        state.booking.error = null;
        state.booking.success = false;
      })
      .addCase(createPhotographerBooking.fulfilled, (state, action) => {
        state.booking.loading = false;
        state.booking.success = true;
      })
      .addCase(createPhotographerBooking.rejected, (state, action) => {
        state.booking.loading = false;
        state.booking.error = (action.payload as string) || 'Failed to create photographer booking';
        state.booking.success = false;
      });
  },
});

export default photographersSlice.reducer;