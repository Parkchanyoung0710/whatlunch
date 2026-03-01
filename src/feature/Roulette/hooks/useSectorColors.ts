import { useMemo } from 'react';

import { createHuePalette } from '@/feature/Roulette/utils/createHuePalette';

export function useSectorColors(items: Menu.GetMenuRes[]) {
  const itemCount = items.length;

  // 아이템 개수 기반 색상 팔레트 생성
  const sectorColors = useMemo(() => {
    if (itemCount === 0) return [];
    return createHuePalette(itemCount);
  }, [itemCount]);

  return sectorColors;
}
