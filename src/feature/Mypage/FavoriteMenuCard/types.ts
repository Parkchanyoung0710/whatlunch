import { Category } from '@/types/enum';

// 메뉴 카테고리 (ALL, BEST 제외)
export type MenuCategory = Exclude<Category, Category.ALL | Category.BEST>;

export interface FavoriteMenu {
  id: string;
  name: string;
  category: MenuCategory;
}
