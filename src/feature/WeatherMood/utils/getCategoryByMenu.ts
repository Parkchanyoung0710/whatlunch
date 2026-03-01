import { Category } from '@/types/enum';

type MenuCategory = Exclude<Category, Category.ALL | Category.BEST>;

export function getCategoryByMenu(menu: string): MenuCategory {
  if (
    ['비빔밥', '국밥', '불고기', '삼겹살', '냉면', '잡채', '떡국', '순두부찌개'].some(m =>
      menu.includes(m)
    )
  ) {
    return Category.KOREAN;
  }

  if (
    ['짜장면', '짬뽕', '탕수육', '마파두부', '양장피', '유산슬', '동파육', '깐풍기'].some(m =>
      menu.includes(m)
    )
  ) {
    return Category.CHINESE;
  }

  if (
    ['초밥', '돈코츠라멘', '우동', '규동', '타코야키', '오코노미야끼', '튀김', '야키토리'].some(m =>
      menu.includes(m)
    )
  ) {
    return Category.JAPANESE;
  }

  if (
    ['피자', '파스타', '리조또', '라자냐', '햄버거', '스테이크', '샐러드', '피시앤칩스'].some(m =>
      menu.includes(m)
    )
  ) {
    return Category.WESTERN;
  }

  if (
    ['김밥', '떡볶이', '라면', '토스트', '콘도그', '만두', '순대', '닭강정'].some(m =>
      menu.includes(m)
    )
  ) {
    return Category.SNACK;
  }

  return Category.KOREAN as MenuCategory;
}
