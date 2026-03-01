import { useMemo } from 'react';

import { Category, Context } from '@/types/enum';

const FOOD_ICONS: Record<Category, string> = {
  [Category.ALL]: '🍽️',
  [Category.BEST]: '⭐',
  [Category.CHINESE]: '🍜',
  [Category.WESTERN]: '🍔',
  [Category.JAPANESE]: '🍣',
  [Category.KOREAN]: '🍚',
  [Category.SNACK]: '🌭',
};

const SITUATION_ICONS: Record<Context, string> = {
  [Context.LUNCH]: '🍱',
  [Context.SOLO]: '🙋‍♂️',
  [Context.CELEBRATION]: '🎉',

  [Context.DATE]: '💖',
  [Context.LIGHT]: '☕',
  [Context.LATE_NIGHT]: '🌙',
  [Context.STRESS]: '😡',
};

interface FilterOption {
  value: string;
  label: string;
  icon: string;
  isActive: boolean;
}

export function useFilterOptions(
  selectedFoodTypes: Category | null,
  selectedSituation: Context | null
): {
  foodOptions: FilterOption[];
  situationOptions: FilterOption[];
} {
  const foodOptions = useMemo(() => {
    const categories: Category[] = [
      Category.ALL,
      Category.KOREAN,
      Category.CHINESE,
      Category.JAPANESE,
      Category.WESTERN,
      Category.SNACK,
      Category.BEST,
    ];

    return categories.map(category => ({
      value: category,
      label: category,
      icon: FOOD_ICONS[category],
      isActive: selectedFoodTypes === category,
    }));
  }, [selectedFoodTypes]);

  const situationOptions = useMemo(() => {
    const contexts: Context[] = [
      Context.LUNCH,
      Context.SOLO,
      Context.DATE,
      Context.LIGHT,
      Context.LATE_NIGHT,
      Context.STRESS,
      Context.CELEBRATION,
    ];

    return contexts.map(context => ({
      value: context,
      label: context,
      icon: SITUATION_ICONS[context],
      isActive: selectedSituation === context,
    }));
  }, [selectedSituation]);

  return { foodOptions, situationOptions };
}
