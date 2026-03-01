import type { WeatherMain } from '@/types/api/weather';

// 추천 메뉴 최소 개수
export const MIN_RECOMMEND_COUNT = 6;

// 온도 구간 기준값
export const TEMP_BOUNDARY = {
  cold: 5,
  cool: 12,
  mild: 20,
  warm: 27,
} as const;

// fallback 메뉴
export const fallbackMenus: string[] = ['김밥', '라면', '우동', '파스타', '피자', '비빔밥'];

// 온도 구간별 추천 메뉴
export const tempMenus = {
  cold: ['우동', '돈코츠라멘', '순두부찌개', '국밥', '떡국', '짬뽕'],

  cool: ['짜장면', '파스타', '라자냐', '햄버거', '피시앤칩스', '비빔밥'],

  mild: ['김밥', '파스타', '샐러드', '초밥', '규동', '잡채'],

  warm: ['비빔밥', '냉면', '초밥', '샐러드', '타코야키', '김밥'],

  hot: ['냉면', '김밥', '초밥', '샐러드', '타코야키', '우동'],
} as const;

export type TempGroup = keyof typeof tempMenus;

// 날씨 상태별 추천 메뉴
export const weatherMenus: Record<WeatherMain, string[]> = {
  Clear: ['비빔밥', '샐러드', '초밥', '파스타', '타코야키', '김밥'],

  Clouds: ['우동', '돈코츠라멘', '파스타', '피자', '국밥', '잡채'],

  Rain: ['국밥', '순두부찌개', '우동', '짬뽕', '잡채'],

  Drizzle: ['우동', '돈코츠라멘', '만두', '잡채', '떡국'],

  Thunderstorm: ['떡볶이', '깐풍기', '닭강정', '짬뽕', '탕수육'],

  Snow: ['떡국', '순두부찌개', '국밥', '우동', '돈코츠라멘', '리조또'],

  Mist: ['우동', '규동', '잡채', '리조또', '비빔밥'],

  Fog: ['우동', '순두부찌개', '규동', '리조또', '국밥'],

  Haze: ['삼겹살', '불고기', '냉면', '비빔밥', '피자'],

  Dust: ['삼겹살', '불고기', '탕수육', '피자', '햄버거'],

  Sand: ['삼겹살', '불고기', '탕수육', '피자', '햄버거'],

  Smoke: ['불고기', '삼겹살', '순두부찌개', '국밥', '돈코츠라멘'],

  Ash: ['샐러드', '비빔밥', '초밥', '잡채', '냉면'],

  Squall: ['햄버거', '피자', '라면', '닭강정', '떡볶이'],
};
