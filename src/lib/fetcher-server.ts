/**
 * @description 서버 사이드에서 API 요청을 처리하는 fetcher 함수입니다.
 * https://ko.react.dev/reference/rsc/use-server
 */
'use server';

import { cookies } from 'next/headers';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080';

export async function fetcherServer<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (allCookies.length > 0) {
    const cookieHeaderValue = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    headers.set('Cookie', cookieHeaderValue);
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorMessage = `API 요청 실패: ${res.status}`;

    try {
      const errorData = await res.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      console.error('[FetcherServer] 응답 파싱 실패:', e);
    }

    throw new Error(errorMessage);
  }

  const text = await res.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}
