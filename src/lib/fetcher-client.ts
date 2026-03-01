const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080';

export interface FetchOptions extends RequestInit {
  _retry?: boolean;
}

export interface ApiErrorResponse {
  message?: string;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.ok;
  } catch (error) {
    console.error('[FetcherClient] Refresh 실패:', error);
    return false;
  }
}

export async function fetcherClient<T>(url: string, options: FetchOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  // 401 에러 시 자동 Refresh 시도
  if (res.status === 401 && !options._retry && url !== '/auth/refresh' && url !== '/auth/login') {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return fetcherClient<T>(url, { ...options, _retry: true });
    } else {
      console.error('[FetcherClient] Refresh 실패, 로그아웃 처리');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }
  }

  if (!res.ok) {
    let message = '[FetcherClient] 요청에 실패했습니다';

    try {
      const data: ApiErrorResponse = await res.json();
      if (data?.message) {
        message = data.message;
      }
    } catch (err) {
      console.error('[FetcherClient] 응답 파싱 실패:', err);
    }

    throw new Error(message);
  }

  const text = await res.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}
