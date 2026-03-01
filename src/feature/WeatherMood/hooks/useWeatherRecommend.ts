import { useEffect, useState } from 'react';

import { getCurrentTimeSlot } from '@/feature/WeatherMood/components/Weather/constants/timeSlot';

import { createRecommendKey } from '@/feature/WeatherMood/components/Weather/utils/createRecommendKey';
import { getTempGroup } from '@/feature/WeatherMood/components/Weather/utils/weatherRecommend';
import { makeFinalRecommend } from '@/feature/WeatherMood/components/Weather/utils/weatherRecommend';

import type { WeatherMain } from '@/types/api/weather';

// 추천 메뉴 목록 타입 (UI/캐시 공통)
type RecommendMenus = string[];

interface WeatherRecommendState {
  menus: RecommendMenus | null; // UI 표시용 (계산 전 null)
  loading: boolean; // 추천 계산 중 여부
}

interface CachedRecommendPayload {
  menus: RecommendMenus; // 캐시된 추천 메뉴
  cachedAt: number; // 캐시 생성 시각
}

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 캐시 유효기간: 12시간

export function useWeatherRecommend(weather: WeatherMain | null, temp: number | null) {
  const [state, setState] = useState<WeatherRecommendState>({ menus: null, loading: true });

  useEffect(() => {
    if (!weather || temp === null) {
      // 입력 미완료 시 로딩 유지함
      setState({ menus: null, loading: true });
      return;
    }

    const now = Date.now();
    const timeSlot = getCurrentTimeSlot();
    const key = createRecommendKey(weather, getTempGroup(temp), timeSlot); // 조건별 캐시 키

    try {
      const cachedRaw = window.localStorage.getItem(key);

      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as CachedRecommendPayload;

        if (cached?.cachedAt && now - cached.cachedAt < CACHE_DURATION) {
          // 캐시 hit = 이미 계산된 값이 있어서 그대로 쓰는 경우
          setState({ menus: cached.menus, loading: false });
          return;
        }

        window.localStorage.removeItem(key); // 캐시 만료 및 오염
      }

      const result = makeFinalRecommend(weather, temp); // 추천 생성
      window.localStorage.setItem(key, JSON.stringify({ menus: result, cachedAt: now })); // 캐시 저장

      setState({ menus: result, loading: false });
    } catch {
      setState({ menus: null, loading: false }); // 캐시 및 파싱 실패 시 안전 처리
    }
  }, [weather, temp]);

  return state;
}
