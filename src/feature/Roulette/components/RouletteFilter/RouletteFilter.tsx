'use client';

import { useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

import Button from '@/shared/components/Button';
import { Category, Context } from '@/types/enum';

import { useRouletteFilter } from '../../hooks/useRouletteFilter';
import { useFilterOptions } from '../../hooks/useFilterOptions';

import styles from './RouletteFilter.module.scss';

interface RouletteFilterProps {
  onChange: (menus: Menu.GetMenuRes[]) => void;
  onFiltersChange?: (
    filters: { category?: Category[]; context?: Context[] },
    mode: 'category' | 'context',
    selectedFoodTypes: Category | null,
    selectedSituation: Context | null
  ) => void;
  disabled?: boolean;
  syncedFilterState?: {
    mode: 'category' | 'context';
    selectedFoodTypes: Category | null;
    selectedSituation: Context | null;
    timestamp?: number;
    updatedBy?: string;
  } | null;
  currentUserId?: string | null;
  isVisible?: boolean;
}

export default function RouletteFilter({
  onChange,
  onFiltersChange,
  disabled = false,
  syncedFilterState = null,
  currentUserId = null,
  isVisible = true,
}: RouletteFilterProps) {
  const params = useParams();
  const roomCode = (params?.roomId as string) || 'solo';
  const isSoloMode = roomCode === 'solo';

  // 사용자 액션 시 즉시 소켓으로 필터 변경 전송
  const handleUserAction = useCallback(
    (newMode: 'category' | 'context', newFood: Category | null, newSituation: Context | null) => {
      // 솔로 모드에서는 소켓 전송 안 함
      if (isSoloMode) return;

      // 같이정하기 모드에서만 소켓으로 필터 변경 전송
      onFiltersChange?.(
        {
          category: newFood && newFood !== Category.ALL ? [newFood] : undefined,
          context: newSituation ? [newSituation] : undefined,
        },
        newMode,
        newFood,
        newSituation
      );
    },
    [isSoloMode, onFiltersChange]
  );

  // 같이 정하기 모드에서 동기화된 필터 상태 사용
  const {
    state: { mode, selectedFoodTypes, selectedSituation, menus },
    actions: { changeMode, toggleFoodType, toggleSituation },
  } = useRouletteFilter(syncedFilterState, currentUserId ?? undefined, handleUserAction);

  const { foodOptions, situationOptions } = useFilterOptions(selectedFoodTypes, selectedSituation);

  useEffect(() => {
    if (!menus || menus.length === 0) return;
    if (isSoloMode) {
      onChange(menus);
    }
  }, [menus, onChange, isSoloMode, roomCode]);

  const modeClass = (isActive: boolean) =>
    `${styles['filter__mode__tab']} ${isActive ? styles['filter__mode__tab--active'] : ''}`;

  return (
    <div className={styles['filter']} style={{ display: isVisible ? 'block' : 'none' }}>
      <div className={styles['filter__mode']}>
        <button
          type="button"
          disabled={disabled}
          className={modeClass(mode === 'category')}
          onClick={() => changeMode('category')}
        >
          음식 종류
        </button>

        <button
          type="button"
          disabled={disabled}
          className={modeClass(mode === 'context')}
          onClick={() => changeMode('context')}
        >
          상황별
        </button>
      </div>

      <div className={styles['filter__options']}>
        {mode === 'category' &&
          foodOptions.map(opt => (
            <Button
              key={opt.value}
              disabled={disabled}
              variant="blue"
              mode={opt.isActive ? 'fill' : 'outline'}
              padding="8px 18px"
              fontSize="14px"
              className={styles['filter__options__item']}
              onClick={() => toggleFoodType(opt.value as Category)}
            >
              {opt.icon}
              {opt.label}
            </Button>
          ))}

        {mode === 'context' &&
          situationOptions.map(opt => (
            <Button
              key={opt.value}
              disabled={disabled}
              variant="blue"
              mode={opt.isActive ? 'fill' : 'outline'}
              padding="8px 18px"
              fontSize="14px"
              className={styles['filter__options__item']}
              onClick={() => toggleSituation(opt.value as Context)}
            >
              {opt.icon}
              {opt.label}
            </Button>
          ))}
      </div>
    </div>
  );
}
