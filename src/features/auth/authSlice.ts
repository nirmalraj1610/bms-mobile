import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { signup as signupService, login as loginService } from './auth.service';
import type { AuthState } from './auth.types';
import { clearToken } from '../../lib/http';

const initialState: AuthState = {
  signup: { loading: false, error: null, user: null },
  login: { loading: false, error: null, user: null },
};

export const signup = createAsyncThunk(
  'auth/signup',
  async (payload: { email: string; password: string; full_name: string; phone?: string; user_type: 'client' | 'photographer' | 'studio_owner' }, { rejectWithValue }) => {
    try {
      const res = await signupService(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.error || 'Failed to sign up');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await loginService(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.error || 'Failed to sign in');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearToken();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.signup.loading = true;
        state.signup.error = null;
        state.signup.user = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.signup.loading = false;
        state.signup.user = action.payload?.user || null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.signup.loading = false;
        state.signup.error = (action.payload as string) || 'Failed to sign up';
      })
      .addCase(login.pending, (state) => {
        state.login.loading = true;
        state.login.error = null;
        state.login.user = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.login.loading = false;
        state.login.user = action.payload?.user || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.login.loading = false;
        state.login.error = (action.payload as string) || 'Failed to sign in';
      })
      .addCase(logout.fulfilled, (state) => {
        state.signup = { loading: false, error: null, user: null };
        state.login = { loading: false, error: null, user: null };
      });
  },
});

export default authSlice.reducer;