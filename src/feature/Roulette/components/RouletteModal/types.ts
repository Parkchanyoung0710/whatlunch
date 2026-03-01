import { Category } from '@/types/enum';

export interface RouletteMenu {
  name: string;
  category: Exclude<Category, Category.ALL | Category.BEST>;
}

export interface RouletteModalProps {
  menu: Menu.GetMenuRes | null;
  onClose: () => void;
  roomCode?: string;
}
