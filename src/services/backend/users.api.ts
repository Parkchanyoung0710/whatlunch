import { fetcherClient } from '@/lib/fetcher-client';
import { fetcherServer } from '@/lib/fetcher-server';

// 서버 사이드에서 호출하는 함수
export const getMyFoodDotsServer = async (): Promise<string[]> => {
  return fetcherServer<string[]>('/users/me/food-dots', {
    method: 'GET',
  });
};

// 클라이언트 사이드에서 호출하는 함수
export const getMyFoodDots = async (): Promise<string[]> => {
  return fetcherClient<string[]>('/users/me/food-dots', {
    method: 'GET',
  });
};

// 음식 도트 추가
export const addFoodDot = async (dotId: string): Promise<string[]> => {
  return fetcherClient<string[]>('/users/me/food-dots', {
    method: 'POST',
    body: JSON.stringify({ dotId }),
  });
};

// 음식 도트 제거
export const removeFoodDot = async (dotId: string): Promise<string[]> => {
  return fetcherClient<string[]>(`/users/me/food-dots/${dotId}`, {
    method: 'DELETE',
  });
};
