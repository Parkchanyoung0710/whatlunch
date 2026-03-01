import { fetcherClient } from '@/lib/fetcher-client';
import { fetcherServer } from '@/lib/fetcher-server';

interface Fetcher {
  <T>(url: string, options?: RequestInit): Promise<T>;
}

class FavoritesService {
  constructor(private fetcher: Fetcher) {}
  // 찜 목록 조회
  getMyFavorites(): Promise<Favorite.GetMyFavoritesRes[]> {
    return this.fetcher<Favorite.GetMyFavoritesRes[]>('/favorites/list', {
      method: 'GET',
    });
  }

  // 찜 기반 선호도 분석 조회
  getMyPreference(): Promise<Favorite.PreferenceResult> {
    return this.fetcher<Favorite.PreferenceResult>('/favorites/preference', {
      method: 'GET',
    });
  }

  // 찜 추가
  addFavorite(menuId: string): Promise<{ isFavorite: boolean }> {
    return this.fetcher<{ isFavorite: boolean }>('/favorites/add', {
      method: 'POST',
      body: JSON.stringify({ menuId }),
    });
  }

  // 찜 제거
  removeFavorite(menuId: string): Promise<{ isDeleted: boolean }> {
    return this.fetcher<{ isDeleted: boolean }>('/favorites/remove', {
      method: 'DELETE',
      body: JSON.stringify({ menuId }),
    });
  }
}

export const favoritesServiceClient = new FavoritesService(fetcherClient);
export const favoritesServiceServer = new FavoritesService(fetcherServer);
