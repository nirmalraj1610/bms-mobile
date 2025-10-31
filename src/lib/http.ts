import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://wuyhbxztatoevkfavoon.supabase.co/functions/v1';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface ApiError {
  error: string;
  status?: number;
}

function buildQueryString(query?: QueryParams): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const q = params.toString();
  return q ? `?${q}` : '';
}

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token');
    // return 'eyJhbGciOiJIUzI1NiIsImtpZCI6Ii9ZOXc0dnZacFhyTDRPSjQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3d1eWhieHp0YXRvZXZrZmF2b29uLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI4ODZmOWNlYi02YmM4LTQ3YzMtYjg3MC04OWMwZTUwNjZiNmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYxMTM0MzQ0LCJpYXQiOjE3NjExMzA3NDQsImVtYWlsIjoicmdvd3RoYW1vZmZpY2VAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiZ293dGhhbSBzaWRoYXJ0aGFuIiwidXNlcl90eXBlIjoic3R1ZGlvX293bmVyIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjExMzA3NDR9XSwic2Vzc2lvbl9pZCI6IjUyNTk1YTQyLTIzMTEtNGEyYi04NjU4LWI5MjQ3NDA5NGFhNiIsImlzX2Fub255bW91cyI6ZmFsc2V9.5fjMtlhefYAeqDtagNqJ4Hx0ymCWnH5LIGPvU-LE2x0'
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    query?: QueryParams;
    auth?: boolean; // whether to attach Authorization automatically
  } = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, query, auth = true } = opts;

  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;
  const token = auth ? await getToken() : null;

  const init: RequestInit = {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, init);

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const err: ApiError = typeof data === 'string' ? { error: data, status: res.status } : { ...(data as ApiError), status: res.status };
    throw err;
  }

  return data as T;
}

export async function saveToken(accessToken: string) {
  try {
    await AsyncStorage.setItem('auth_token', accessToken);
  } catch {
    // ignore
  }
}

export async function saveUserData(userData: object) {
  try {
    const userDetails = JSON.stringify(userData);
    await AsyncStorage.setItem('UserData', userDetails);
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('❌ Failed to save user data:', error);
  }
}

export async function getUserData() {
  try {
    const storedData = await AsyncStorage.getItem('UserData');
    if (storedData) {
      return JSON.parse(storedData); // converts back to JS object
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get user data:', error);
    return null;
  }
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch {
    // ignore
  }
}