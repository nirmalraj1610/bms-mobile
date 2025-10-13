import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchNotifications, markReadNotifications } from './notifications.service';
import type { NotificationsState } from './notifications.types';

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
  marking: false,
};

export const getNotifications = createAsyncThunk(
  'notifications/list',
  async (
    query: { unread_only?: boolean; limit?: number } = {},
    { rejectWithValue }
  ) => {
  try {
    const res = await fetchNotifications(query);
    return res.notifications || [];
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to load notifications');
  }
});

export const markNotificationsRead = createAsyncThunk('notifications/markRead', async (payload: { notification_ids: string[] }, { rejectWithValue }) => {
  try {
    const res = await markReadNotifications(payload);
    return { ...res, ids: payload.notification_ids };
  } catch (err: any) {
    return rejectWithValue(err?.error || 'Failed to mark notifications');
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to load notifications';
      })
      .addCase(markNotificationsRead.pending, (state) => {
        state.marking = true;
        state.error = null;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        state.marking = false;
        const ids: string[] = (action.payload as any)?.ids || [];
        state.items = state.items.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n));
      })
      .addCase(markNotificationsRead.rejected, (state, action) => {
        state.marking = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to mark notifications';
      });
  },
});

export default notificationsSlice.reducer;