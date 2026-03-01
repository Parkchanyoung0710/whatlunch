'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, TrendingUp, Layers, Clock, CookingPot, Users } from 'lucide-react';

import { favoritesServiceClient } from '@/services/backend/favorites.api';

import { MENU_SUMMARY_MOCK } from './mock';
import type { MenuSummaryItemType, MenuSummaryItem } from './types';
import styles from './MenuSummaryCard.module.scss';

const ITEM_ICON_MAP: Record<MenuSummaryItemType, LucideIcon> = {
  category: Layers,
  mealTier: CookingPot,
  time: Clock,
  style: Users,
};

export default function MenuSummaryCard() {
  const { items } = MENU_SUMMARY_MOCK;

  const { data: preference } = useQuery({
    queryKey: ['preference'],
    queryFn: () => favoritesServiceClient.getMyPreference(),
  });

  // 가장 선호하는 카테고리 항목 생성
  const categoryItem: MenuSummaryItem = useMemo(() => {
    if (!preference || preference.status === 'EMPTY') {
      return {
        type: 'category',
        title: '가장 선호하는 카테고리',
        value: '데이터 없음',
      };
    }

    const values = preference.distribution ? Object.values(preference.distribution) : [];
    const percentage = values.length > 0 ? Math.max(...(values as number[])) : undefined;

    return {
      type: 'category',
      title: '가장 선호하는 카테고리',
      value: preference.summary,
      percentage,
    };
  }, [preference]);

  // 목업 + category 교체
  const displayItems = useMemo(() => {
    return [categoryItem, ...items.filter(item => item.type !== 'category')];
  }, [categoryItem, items]);

  const isEmpty = !preference || preference.status === 'EMPTY';

  return (
    <section className={styles['menu-summary']} aria-label="최근 메뉴 성향 요약">
      <header className={styles['menu-summary__header']}>
        <div className={styles['menu-summary__header-inner']}>
          <h2 className={styles['menu-summary__title']}>최근 메뉴 성향 요약</h2>
          <TrendingUp className={styles['menu-summary__header-icon']} aria-hidden="true" />
        </div>
      </header>

      {isEmpty ? (
        <div className={styles['menu-summary__empty']} aria-live="polite">
          <ClipboardList className={styles['menu-summary__empty-icon']} aria-hidden="true" />
          <p className={styles['menu-summary__empty-title']}>최근 메뉴 기록이 아직 없어요</p>
          <p className={styles['menu-summary__empty-desc']}>
            메뉴를 한 번 선택하면, 나만의 메뉴 성향 분석이 시작돼요.
          </p>
        </div>
      ) : (
        <ul className={styles['menu-summary__list']}>
          {displayItems.map(item => {
            const Icon = ITEM_ICON_MAP[item.type] ?? Layers;
            const modifier = styles[`menu-summary__item--${item.type}`];

            const percent =
              typeof item.percentage === 'number'
                ? Math.max(0, Math.min(100, item.percentage))
                : undefined;

            return (
              <li
                key={`${item.type}-${item.title}`}
                className={[styles['menu-summary__item'], modifier].filter(Boolean).join(' ')}
              >
                <div className={styles['menu-summary__item-header']}>
                  <Icon className={styles['menu-summary__item-icon']} aria-hidden="true" />
                  <span>{item.title}</span>
                </div>

                {item.type === 'category' ? (
                  <>
                    <p className={styles['menu-summary__value']}>{preference?.summary}</p>

                    {preference?.status === 'CONFIDENT' && preference.topCategories?.[0] && (
                      <div className={styles['menu-summary__category-detail']}>
                        <div className={styles['menu-summary__category-row']}>
                          <span className={styles['menu-summary__category-label']}>
                            {preference.topCategories[0]}
                          </span>
                          <span className={styles['menu-summary__category-percent']}>
                            {preference.distribution?.[preference.topCategories[0]] ?? 0}%
                          </span>
                        </div>

                        <div
                          className={styles['menu-summary__bar']}
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            preference.distribution?.[preference.topCategories[0]] ?? 0
                          }
                        >
                          <div
                            className={styles['menu-summary__bar-fill']}
                            style={{
                              width: `${
                                preference.distribution?.[preference.topCategories[0]] ?? 0
                              }%`,
                            }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className={styles['menu-summary__value']}>{item.value}</p>

                    {percent !== undefined && (
                      <div
                        className={styles['menu-summary__bar']}
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                      >
                        <div
                          className={styles['menu-summary__bar-fill']}
                          style={{ width: `${percent}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
