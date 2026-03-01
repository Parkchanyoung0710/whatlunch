import { Category } from '@/types/enum';
import type { MenuCategory } from '@/domain/WeatherMood/components/MenuModal/types';

const GLOBAL_FALLBACK_IMAGE = '/foods/noimg.png';

type FoodImageRule = {
  keywords: string[];
  src: string;
};

type CategoryImageConfig = {
  defaultSrc: string;
  rules: FoodImageRule[];
};

// 카테고리별 이미지 설정
const FOOD_IMAGE_CONFIG: Record<MenuCategory, CategoryImageConfig> = {
  [Category.KOREAN]: {
    defaultSrc: '/foods/Korean/noimg.png',
    rules: [
      { keywords: ['비빔밥'], src: '/foods/Korean/Bibimbap.png' },
      { keywords: ['국밥'], src: '/foods/Korean/Gukbap.png' },
      { keywords: ['불고기'], src: '/foods/Korean/Bulgogi.png' },
      { keywords: ['삼겹살'], src: '/foods/Korean/Samgyeopsal.png' },
      { keywords: ['냉면'], src: '/foods/Korean/Naengmyeon.png' },
      { keywords: ['잡채'], src: '/foods/Korean/Japchae.png' },
      { keywords: ['떡국'], src: '/foods/Korean/Tteokguk.png' },
      { keywords: ['순두부'], src: '/foods/Korean/Sundubu_Jjigae.png' },
    ],
  },

  [Category.CHINESE]: {
    defaultSrc: '/foods/Chinese/noimg.png',
    rules: [
      { keywords: ['짜장'], src: '/foods/Chinese/Jajangmyeon.png' },
      { keywords: ['짬뽕'], src: '/foods/Chinese/Jjamppong.png' },
      { keywords: ['탕수육'], src: '/foods/Chinese/Tangsuyuk.png' },
      { keywords: ['마파'], src: '/foods/Chinese/Mapo_Tofu.png' },
      { keywords: ['양장피'], src: '/foods/Chinese/Yangjangpi.png' },
      { keywords: ['유산슬'], src: '/foods/Chinese/Yusanseul.png' },
      { keywords: ['깐풍'], src: '/foods/Chinese/Kkanpunggi.png' },
      { keywords: ['동파'], src: '/foods/Chinese/Dongpo_Pork.png' },
    ],
  },

  [Category.JAPANESE]: {
    defaultSrc: '/foods/Japanese/noimg.png',
    rules: [
      { keywords: ['초밥', '스시'], src: '/foods/Japanese/Sushi.png' },
      { keywords: ['돈코츠라멘'], src: '/foods/Japanese/Tonkotsu_Ramen.png' },
      { keywords: ['우동'], src: '/foods/Japanese/Udon.png' },
      { keywords: ['야키토리'], src: '/foods/Japanese/Yakitori.png' },
      { keywords: ['타코야키'], src: '/foods/Japanese/Takoyaki.png' },
      { keywords: ['튀김'], src: '/foods/Japanese/Tempura.png' },
      { keywords: ['규동'], src: '/foods/Japanese/Gyudon.png' },
      { keywords: ['오코노미'], src: '/foods/Japanese/Okonomiyaki.png' },
    ],
  },

  [Category.WESTERN]: {
    defaultSrc: '/foods/Western/noimg.png',
    rules: [
      { keywords: ['피시앤칩스'], src: '/foods/Western/FishandChips.png' },
      { keywords: ['리조또'], src: '/foods/Western/Risotto.png' },
      { keywords: ['라자냐'], src: '/foods/Western/Lasagna.png' },
      { keywords: ['샐러드'], src: '/foods/Western/Salad.png' },
      { keywords: ['햄버거'], src: '/foods/Western/Hamburger.png' },
      { keywords: ['피자'], src: '/foods/Western/Pizza.png' },
      { keywords: ['파스타'], src: '/foods/Western/Pasta.png' },
      { keywords: ['스테이크'], src: '/foods/Western/Steak.png' },
    ],
  },

  [Category.SNACK]: {
    defaultSrc: '/foods/Snack/noimg.png',
    rules: [
      { keywords: ['떡볶이'], src: '/foods/Snack/Tteokbokki.png' },
      { keywords: ['김밥'], src: '/foods/Snack/Gimbap.png' },
      { keywords: ['라면'], src: '/foods/Snack/Ramyeon.png' },
      { keywords: ['토스트'], src: '/foods/Snack/Street_Toast.png' },
      { keywords: ['핫도그'], src: '/foods/Snack/Corn_Dog.png' },
      { keywords: ['만두'], src: '/foods/Snack/Assorted_Mandu.png' },
      { keywords: ['닭강정'], src: '/foods/Snack/Dakgangjeong.png' },
      { keywords: ['순대'], src: '/foods/Snack/Sundae.png' },
    ],
  },
};

/**
 * 메뉴 이름 + 카테고리를 기준으로 음식 이미지 경로를 반환한다.
 *
 * - 키워드 매칭 실패 시: 카테고리 기본 이미지
 * - 카테고리 자체가 잘못된 경우: 글로벌 fallback 이미지
 */
export function getFoodImageByMenu(menuName: string, category: MenuCategory): string {
  const normalized = menuName.replace(/\s/g, '');
  const config = FOOD_IMAGE_CONFIG[category];

  if (!config) return GLOBAL_FALLBACK_IMAGE;

  const matched = config.rules.find(rule =>
    rule.keywords.some(keyword => normalized.includes(keyword))
  );

  return matched?.src ?? config.defaultSrc ?? GLOBAL_FALLBACK_IMAGE;
}
