import { shuffleArray } from '@/feature/WeatherMood/utils/shuffle';

const RECOMMEND_LIMIT = 6;

export function generateRecommendations(
  sourceMenus: readonly string[],
  recentMenus: readonly string[] = []
): string[] {
  // 최근 추천된 메뉴는 우선 제외
  const filtered = sourceMenus.filter(menu => !recentMenus.includes(menu));

  // 중복 제거
  const uniqueFiltered = Array.from(new Set(filtered));
  const uniqueSource = Array.from(new Set(sourceMenus));

  // 최근 제외 후 개수가 부족하면 전체 메뉴에서 보충
  const menuPool = uniqueFiltered.length >= RECOMMEND_LIMIT ? uniqueFiltered : uniqueSource;

  // 랜덤성 확보 (1회 셔플)
  const shuffled = shuffleArray(menuPool);

  return shuffled.slice(0, Math.min(RECOMMEND_LIMIT, shuffled.length));
}
