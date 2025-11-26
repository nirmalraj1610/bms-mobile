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
    const direct = await AsyncStorage.getItem('auth_token');
    if (direct) return direct;
    // Fallback: attempt to read from saved user data if token key is missing
    const rawUser = await AsyncStorage.getItem('UserData');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        const fallbackToken = parsed?.session?.access_token || parsed?.access_token || null;
        if (fallbackToken) {
          // Cache it for subsequent calls
          await AsyncStorage.setItem('auth_token', fallbackToken);
          try { console.log('[auth] Restored access token from UserData fallback'); } catch {}
          return fallbackToken;
        }
      } catch {}
    }
    return null;
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

  // Debug logging for authentication and request metadata
  try {
    let tokenMeta: any = undefined;
    if (token) {
      try {
        const [, payloadB64] = String(token).split('.');
        const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
        const now = Math.floor(Date.now() / 1000);
        tokenMeta = {
          exp: json?.exp,
          iat: json?.iat,
          isExpired: typeof json?.exp === 'number' ? json.exp <= now : undefined,
          userId: json?.sub,
          role: json?.role,
        };
      } catch {}
    }
    console.log('[apiFetch] Request init:', {
      path,
      url,
      method,
      auth,
      hasToken: !!token,
      contentType: body instanceof FormData ? 'multipart/form-data' : 'application/json',
      tokenMeta,
    });
  } catch {}

  const init: RequestInit = {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  };

  try {
    const authHeader = (init.headers as any)?.Authorization as string | undefined;
    if (authHeader) {
      const preview = authHeader.slice(0, 20) + '...';
      console.log('[apiFetch] Authorization header attached:', preview);
    } else if (auth) {
      console.error('[apiFetch] Authorization header missing (no token found)');
    } else {
      console.log('[apiFetch] Authorization header intentionally omitted (auth:false)');
    }
  } catch {}

  const res = await fetch(url, init);

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    try {
      console.error('[apiFetch] Response error:', {
        status: res.status,
        isJson,
        errorData: data,
      });
    } catch {}
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

export async function clearUserData() {
  try {
    await AsyncStorage.removeItem('UserData');
  } catch {
    // ignore
  }
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch {
    // ignore
  }
}

function atob(arg0: string): string {
  throw new Error('Function not implemented.');
}
