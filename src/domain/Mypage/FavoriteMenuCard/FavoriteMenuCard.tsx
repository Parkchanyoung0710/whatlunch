'use client';

import { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import Modal from '@/shared/components/Modal';
import FavoriteToggle from '@/shared/components/FavoriteToggle';

import styles from './FavoriteMenuCard.module.scss';
import { favoritesServiceClient } from '@/services/backend/favorites.api';

export default function FavoriteMenuCard() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: favoriteMenusRaw = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesServiceClient.getMyFavorites(),
  });

  const favoriteMenus = useMemo(
    () => favoriteMenusRaw.filter(menu => menu != null),
    [favoriteMenusRaw]
  );

  const addFavoriteMutation = useMutation({
    mutationFn: (menuId: string) => favoritesServiceClient.addFavorite(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => {
      toast.error('찜 추가에 실패했습니다.');
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (menuId: string) => favoritesServiceClient.removeFavorite(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => {
      toast.error('찜 삭제에 실패했습니다.');
    },
  });

  const sortedFavorites = useMemo(
    () =>
      favoriteMenus
        .map(menu => ({
          ...menu,
          addedAt: menu?.createdAt ? new Date(menu?.createdAt).getTime() : Date.now(),
        }))
        .sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)),
    [favoriteMenus]
  );

  const handleFavoriteToggle = (menuId: string) => {
    const isActive = favoriteMenus.some(menu => menu?._id === menuId);

    if (isActive) {
      removeFavoriteMutation.mutate(menuId);
    } else {
      addFavoriteMutation.mutate(menuId);
    }
  };

  const favoriteMap = useMemo(
    () =>
      favoriteMenus.reduce(
        (acc, menu) => ({ ...acc, [menu?._id]: true }),
        {} as Record<string, boolean>
      ),
    [favoriteMenus]
  );
  return (
    <>
      <section aria-label="내가 찜한 메뉴" className={styles['meal-favorite']}>
        <header className={styles['meal-favorite__header']}>
          <h2 className={styles['meal-favorite__header__title']}>내가 찜한 메뉴</h2>
          <Star className={styles['meal-favorite__header__icon']} fill="#FFD600" stroke="#FFD600" />
        </header>

        {sortedFavorites.length === 0 ? (
          <div className={styles['meal-favorite__empty']}>
            <Star
              className={styles['meal-favorite__empty__icon']}
              fill="#FFD600"
              stroke="#FFD600"
            />
            <p className={styles['meal-favorite__empty__text']}>아직 찜한 메뉴가 없어요!</p>
          </div>
        ) : (
          <>
            <ul className={styles['meal-favorite__list']}>
              {sortedFavorites.slice(0, 4).map(menu => (
                <li key={menu._id} className={styles['meal-favorite__list__item']}>
                  <div className={styles['meal-favorite__list__item__info']}>
                    <span className={styles['meal-favorite__list__item__info__name']}>
                      {menu.name}
                    </span>
                    <span className={styles['meal-favorite__list__item__info__category']}>
                      {menu.category}
                    </span>
                  </div>

                  <FavoriteToggle
                    isActive={favoriteMap[menu._id] ?? true}
                    onToggle={() => handleFavoriteToggle(menu._id)}
                    size={18}
                  />
                </li>
              ))}
            </ul>

            {sortedFavorites.length > 4 && (
              <div className={styles['meal-favorite__view-all']}>
                <button
                  type="button"
                  className={styles['meal-favorite__view-all__button']}
                  onClick={() => setIsModalOpen(true)}
                >
                  전체 찜 목록 보기
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 전체보기 모달 */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="찜한 메뉴 리스트"
          innerClassName={styles['modal']}
        >
          <ul className={styles['modal__list']}>
            {sortedFavorites.map(menu => (
              <li key={menu._id} className={styles['modal__list__item']}>
                <div className={styles['modal__list__item__info']}>
                  <span className={styles['modal__list__item__info__name']}>{menu.name}</span>
                  <span className={styles['modal__list__item__info__category']}>
                    {menu.category}
                  </span>
                </div>

                <FavoriteToggle
                  isActive={favoriteMap[menu._id] ?? true}
                  onToggle={() => handleFavoriteToggle(menu._id)}
                  size={18}
                />
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
}
