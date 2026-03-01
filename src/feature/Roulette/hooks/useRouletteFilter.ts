import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { Category, Context } from '@/types/enum';
import { rouletteApi } from '@/feature/Roulette/api/roulette.api';

type FilterMode = 'category' | 'context';

interface State {
  mode: FilterMode;
  selectedFoodTypes: Category | null;
  selectedSituation: Context | null;
  menus: Menu.GetMenuRes[];
  isLoading: boolean;
}

interface Actions {
  changeMode: (mode: FilterMode) => void;
  toggleFoodType: (category: Category) => void;
  toggleSituation: (context: Context) => void;
}

export function useRouletteFilter(
  syncedState?: {
    mode: FilterMode;
    selectedFoodTypes: Category | null;
    selectedSituation: Context | null;
    timestamp?: number;
    updatedBy?: string;
  } | null,
  currentUserId?: string,

  // 사용자 클릭 시 즉시 emit을 발생시킬 콜백
  onUserAction?: (mode: FilterMode, foodType: Category | null, situation: Context | null) => void
): { state: State; actions: Actions } {
  const lastLocalUpdateRef = useRef<number>(0);
  const [mode, setMode] = useState<FilterMode>(syncedState?.mode || 'category');
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<Category>(
    syncedState?.selectedFoodTypes || Category.ALL
  );
  const [selectedSituation, setSelectedSituation] = useState<Context | null>(
    syncedState?.selectedSituation || null
  );

  const params = useParams();
  const roomId = (params?.roomId as string) || 'solo';

  useEffect(() => {
    if (!syncedState) return;

    // 자기 에코 방지
    if (currentUserId && syncedState.updatedBy === currentUserId) {
      return;
    }

    // 타임스탬프 비교로 최신 상태인지 확인
    if (syncedState.timestamp && syncedState.timestamp < lastLocalUpdateRef.current) {
      return;
    }

    // 서버에서 받은 상태로 동기화
    setMode(syncedState.mode);
    setSelectedFoodTypes(syncedState.selectedFoodTypes || Category.ALL);
    setSelectedSituation(syncedState.selectedSituation);
  }, [syncedState, currentUserId]);

  const activeFilter = mode === 'category' ? selectedFoodTypes : selectedSituation;

  const { data: fetchedMenus = [], isLoading } = useQuery({
    queryKey: ['roulette-menus', roomId, mode, activeFilter],
    queryFn: async () => {
      try {
        if (mode === 'category' && selectedFoodTypes && selectedFoodTypes !== Category.ALL) {
          const result = await rouletteApi.getMenusByCategory(selectedFoodTypes, roomId);
          return result.slice(0, 6);
        } else if (mode === 'category') {
          const result = await rouletteApi.getAllMenus(roomId);
          return result.slice(0, 6);
        } else if (mode === 'context' && selectedSituation) {
          const result = await rouletteApi.getMenusByContext(selectedSituation, roomId);
          return result.slice(0, 6);
        }
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!roomId,
    retry: 1,
  });

  const changeMode = useCallback(
    (newMode: FilterMode) => {
      lastLocalUpdateRef.current = Date.now();
      setMode(newMode);

      let nextFood = selectedFoodTypes;
      let nextSit = selectedSituation;

      if (newMode === 'context') {
        nextFood = Category.ALL;
        setSelectedFoodTypes(Category.ALL);
      } else {
        nextSit = null;
        setSelectedSituation(null);
      }

      // 상태 변경 후 서버로 전송
      onUserAction?.(newMode, nextFood, nextSit);
    },
    [selectedFoodTypes, selectedSituation, onUserAction]
  );

  const toggleFoodType = useCallback(
    (category: Category) => {
      lastLocalUpdateRef.current = Date.now();
      setMode('category');
      setSelectedSituation(null);

      // 다음 상태를 미리 계산
      const nextVal = selectedFoodTypes === category ? Category.ALL : category;
      setSelectedFoodTypes(nextVal);

      // 상태 변경 후 서버로 전송
      onUserAction?.('category', nextVal, null);
    },
    [selectedFoodTypes, onUserAction]
  );

  const toggleSituation = useCallback(
    (context: Context) => {
      lastLocalUpdateRef.current = Date.now();
      setMode('context');
      setSelectedFoodTypes(Category.ALL);

      // 다음 상태를 미리 계산
      const nextVal = selectedSituation === context ? null : context;
      setSelectedSituation(nextVal);

      // 상태 변경 후 서버로 전송
      onUserAction?.('context', Category.ALL, nextVal);
    },
    [selectedSituation, onUserAction]
  );

  return {
    state: { mode, selectedFoodTypes, selectedSituation, menus: fetchedMenus, isLoading },
    actions: { changeMode, toggleFoodType, toggleSituation },
  };
}
