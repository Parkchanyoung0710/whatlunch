import type { TempGroup } from '@/feature/WeatherMood/components/Weather/constants/recommend';

import type { WeatherMain } from '@/types/api/weather';

import { TEMP_BOUNDARY } from '@/feature/WeatherMood/components/Weather/constants/recommend';
import { fallbackMenus } from '@/feature/WeatherMood/components/Weather/constants/recommend';
import { tempMenus } from '@/feature/WeatherMood/components/Weather/constants/recommend';
import { weatherMenus } from '@/feature/WeatherMood/components/Weather/constants/recommend';
import { MIN_RECOMMEND_COUNT } from '@/feature/WeatherMood/components/Weather/constants/recommend';

import { pickRandomUnique } from '@/feature/WeatherMood/utils/shuffle';

// 온도 값을 미리 정의된 온도 구간(cold~hot)으로 변환
export function getTempGroup(temp: number): TempGroup {
  if (temp <= TEMP_BOUNDARY.cold) return 'cold';
  if (temp <= TEMP_BOUNDARY.cool) return 'cool';
  if (temp <= TEMP_BOUNDARY.mild) return 'mild';
  if (temp <= TEMP_BOUNDARY.warm) return 'warm';
  return 'hot';
}

// 날씨 + 온도 기준으로 최종 추천 메뉴 생성
export function makeFinalRecommend(weather: WeatherMain, temp: number): string[] {
  const tempGroup = getTempGroup(temp);

  // 날씨 / 온도별 메뉴 매핑 => 없으면 fallback 사용
  const weatherMenu = weatherMenus[weather] ?? fallbackMenus;
  const tempMenu = tempMenus[tempGroup] ?? fallbackMenus;

  // 두 메뉴 합치고 중복 제거
  const unique: string[] = Array.from(new Set([...tempMenu, ...weatherMenu]));

  // 최소 추천 개수 미만이면 fallback으로 보정
  const safeMenus =
    unique.length >= MIN_RECOMMEND_COUNT
      ? unique
      : Array.from(new Set(unique.concat(fallbackMenus)));

  // 중복 없이 무작위로 최대 N개 선택
  return pickRandomUnique(safeMenus, MIN_RECOMMEND_COUNT);
}
