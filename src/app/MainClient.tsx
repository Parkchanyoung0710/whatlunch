'use client';

import { useQuery } from '@tanstack/react-query';
import Carousel from '@/shared/components/Carousel';
import type { CarouselItem } from '@/shared/components/Carousel';
import Clock from '@/shared/components/Clock/Clock';
import WeatherMood from '@/feature/WeatherMood/WeatherMood';
import RoomEntryCard from '@/feature/Room/RoomEntryCard/RoomEntryCard';
import QuoteCard from '@/feature/QuoteCard';
import { menusServiceClient } from '@/services/backend/menus.api';
import { mapTopFavoritesToCarousel } from '@/shared/utils/mapTopFavoritesToCarousel';

import styles from './page.module.scss';

// 서버 없을 때도 보여줄 fallback
const FALLBACK_ITEMS: CarouselItem[] = [
  {
    id: 'fallback-1',
    menuName: '추천 메뉴 준비중',
    rank: 1,
    favoriteCount: 0,
    stores: [],
  },
  {
    id: 'fallback-2',
    menuName: '추천 메뉴 준비중',
    rank: 2,
    favoriteCount: 0,
    stores: [],
  },
  {
    id: 'fallback-3',
    menuName: '추천 메뉴 준비중',
    rank: 3,
    favoriteCount: 0,
    stores: [],
  },
];

export default function MainClient() {
  const {
    data: topMenus,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['menus', 'favorites', 'top'],
    queryFn: () => menusServiceClient.getTopFavoriteMenus(3),
    staleTime: 30_000,
  });

  const carouselItems: CarouselItem[] =
    !isLoading && !isError && topMenus?.length
      ? mapTopFavoritesToCarousel(topMenus)
      : FALLBACK_ITEMS;

  return (
    <div className={styles['container']}>
      <section className={styles['container__left']}>
        <h2 className="sr-only">메뉴 추천</h2>
        <Carousel duration={4000} items={carouselItems} />
        <RoomEntryCard />
      </section>

      <section className={styles['container__right']}>
        <h2 className="sr-only">현재 정보</h2>
        <Clock />
        <WeatherMood />
        <QuoteCard />
      </section>
    </div>
  );
}
