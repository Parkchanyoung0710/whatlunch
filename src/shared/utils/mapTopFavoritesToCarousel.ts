import { CarouselItem } from '@/shared/components/Carousel/type';
import type { TopFavoriteMenu } from '@/services/backend/menus.api';
import { getFoodImageByMenu } from './getFoodImageByMenu';
import { createBrandCardsByMenu } from './createBrandCardsByMenu';

export function mapTopFavoritesToCarousel(menus: TopFavoriteMenu[]): CarouselItem[] {
  return menus.map((menu, index) => {
    const image = getFoodImageByMenu(menu.name, menu.category);

    return {
      id: menu.id,
      menuName: menu.name,
      rank: index + 1,
      favoriteCount: menu.favoriteCount,
      stores: createBrandCardsByMenu(menu.name, image),
    };
  });
}
