import { Category, Context } from '@/types/enum';
import { getApiBaseUrl } from '@/shared/hooks/getApiBaseUrl';

interface MenuResponse {
  data: Menu.GetMenuRes[];
}

export const rouletteApi = {
  /**
   * 카테고리별 메뉴 조회
   */
  async getMenusByCategory(category: Category, roomId: string): Promise<Menu.GetMenuRes[]> {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/menus/roulette?category=${encodeURIComponent(
          category
        )}&roomId=${encodeURIComponent(roomId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: MenuResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('getMenusByCategory 오류:', error);
      return [];
    }
  },

  /**
   * 상황별 메뉴 조회
   */
  async getMenusByContext(context: Context, roomId: string): Promise<Menu.GetMenuRes[]> {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/menus/roulette?context=${encodeURIComponent(
          context
        )}&roomId=${encodeURIComponent(roomId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: MenuResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('getMenusByContext 오류:', error);
      return [];
    }
  },

  /**
   * 모든 메뉴 조회
   */
  async getAllMenus(roomId: string): Promise<Menu.GetMenuRes[]> {
    try {
      const url = `${getApiBaseUrl()}/menus?roomId=${encodeURIComponent(roomId)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data: MenuResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('getAllMenus 오류:', error);
      return [];
    }
  },
};
