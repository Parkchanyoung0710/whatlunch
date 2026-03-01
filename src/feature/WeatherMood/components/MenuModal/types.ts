import { Category } from '@/types/enum';

export type MenuCategory = Exclude<Category, Category.ALL | Category.BEST>;

export interface MenuModalProps {
  menu: string;
  category: MenuCategory;
  onClose: () => void;
}
