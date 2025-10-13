import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ProfileState } from './profile.types';
import { getProfile, updateUserProfile, uploadKyc } from './profile.service';

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  updating: false,
  kycUpload: { loading: false, error: null, success: false },
};

export const fetchProfile = createAsyncThunk('profile/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await getProfile();
    return res.profile || null;
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to load profile');
  }
});

export const updateProfile = createAsyncThunk('profile/update', async (payload: Partial<{ name: string; phone: string; address: string }>, { rejectWithValue }) => {
  try {
    const res = await updateUserProfile(payload);
    return res.profile || null;
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to update profile');
  }
});

export const uploadKycDocs = createAsyncThunk('profile/uploadKyc', async (payload: { document_type: string; document_url: string }, { rejectWithValue }) => {
  try {
    const res = await uploadKyc(payload);
    return !!res.document;
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to upload KYC');
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to load profile';
      })
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to update profile';
      })
      .addCase(uploadKycDocs.pending, (state) => {
        state.kycUpload.loading = true;
        state.kycUpload.error = null;
        state.kycUpload.success = false;
      })
      .addCase(uploadKycDocs.fulfilled, (state, action) => {
        state.kycUpload.loading = false;
        state.kycUpload.success = action.payload === true;
      })
      .addCase(uploadKycDocs.rejected, (state, action) => {
        state.kycUpload.loading = false;
        state.kycUpload.error = (action.payload as string) || action.error.message || 'Failed to upload KYC';
      });
  },
});

export default profileSlice.reducer;