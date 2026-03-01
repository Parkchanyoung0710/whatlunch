import { create } from 'zustand';

type FavoritesState = {
  favorites: Favorite.GetMyFavoritesRes[];
  setFavorites: (favorites: Favorite.GetMyFavoritesRes[]) => void;
  addFavorite: (menu: Favorite.GetMyFavoritesRes) => void;
  removeFavorite: (menuId: string) => void;
};

export const useFavoritesStore = create<FavoritesState>(set => ({
  favorites: [],
  setFavorites: favorites => set({ favorites }),
  addFavorite: menu =>
    set(state => {
      // 중복 제거 후 맨 앞에 추가, createdAt을 현재 시간으로 설정
      const filtered = state.favorites.filter(m => m._id !== menu._id);
      const newMenu = { ...menu, createdAt: new Date().toISOString() };
      return { favorites: [newMenu, ...filtered] };
    }),
  removeFavorite: menuId =>
    set(state => ({
      favorites: state.favorites.filter(menu => menu._id !== menuId),
    })),
}));
