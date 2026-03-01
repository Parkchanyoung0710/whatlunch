'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { DicesIcon, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

import Roulette from '@/domain/Roulette';
import KakaoMap from '@/shared/components/KakaoMap';
import BaseInput from '@/shared/components/Input/BaseInput';
import Button from '@/shared/components/Button';
import FavoriteToggle from '@/shared/components/FavoriteToggle';

import { favoritesServiceClient } from '@/services/backend/favorites.api';
import { useRouletteResultStore } from '@/shared/stores/rouletteResultStore';
import { useAuthStore } from '@/domain/Auth/store/auth.store';

import styles from './page.module.scss';

export default function SoloClient() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Menu.GetMenuRes | null>(null);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  const { getResults, addResult, setCurrentRoom } = useRouletteResultStore();
  const [roomResults, setRoomResults] = useState<Menu.GetMenuRes[]>([]);

  // 로그인 여부
  const user = useAuthStore(state => state.user);
  const isLoggedIn = !!user;

  useEffect(() => {
    // 찜한 메뉴 불러오기
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;
      try {
        const favorites = await favoritesServiceClient.getMyFavorites();
        const favMap: Record<string, boolean> = {};
        favorites.forEach(menu => {
          favMap[menu.id] = true;
        });
        setFavoriteMap(favMap);
      } catch {}
    };

    fetchFavorites();
  }, [isLoggedIn]);

  // 솔로 모드 설정
  useEffect(() => {
    setCurrentRoom('solo');
    setRoomResults(getResults('solo'));
  }, [setCurrentRoom, getResults]);

  const handleSpinStart = () => {
    setIsSpinning(true);
  };

  const handleSpinResult = useCallback(
    (selectedMenu: Menu.GetMenuRes | null) => {
      setResult(selectedMenu);
      setSearchKeyword(selectedMenu?.name ?? '');
      setIsSpinning(false);

      if (selectedMenu) {
        addResult('solo', [selectedMenu]);
        setRoomResults(prev => [selectedMenu, ...prev]);
      }
    },
    [addResult]
  );

  const handleSearch = () => {
    if (searchRef.current) {
      setSearchKeyword(searchRef.current.value);
    }
  };

  const handleFavoriteToggle = async (menuId: string) => {
    if (!isLoggedIn) {
      toast.info('찜 기능은 로그인 후 사용할 수 있어요');
      return;
    }

    try {
      const isCurrentlyActive = favoriteMap[menuId] ?? false;

      if (isCurrentlyActive) {
        await favoritesServiceClient.removeFavorite(menuId);
      } else {
        await favoritesServiceClient.addFavorite(menuId);
      }

      // 상태 토글
      setFavoriteMap(prev => ({
        ...prev,
        [menuId]: !prev[menuId],
      }));
    } catch (error) {
      console.error('찜 처리 실패:', error);
      toast.error('찜 처리에 실패했습니다');
    }
  };

  return (
    <div className={styles['solo']}>
      <header className={styles['solo__header']}>
        <div
          className={styles['solo__header__title']}
          aria-label="혼자 메뉴 정하기 - 혼자서도 룰렛을 돌릴 수 있어요!"
        >
          <DicesIcon size={40} className={styles['solo__header__title__icon']} aria-hidden="true" />
          <div className={styles['solo__header__title__text']}>
            <h1>혼자 메뉴 정하기</h1>
            <span>혼자서도 룰렛을 돌릴 수 있어요!</span>
          </div>
        </div>
      </header>

      <div className={styles['solo__content']}>
        <div className={styles['solo__main-section']}>
          <section className={styles['solo__left']} aria-label="룰렛 영역">
            <Roulette
              isSpinning={isSpinning}
              onSpinStart={handleSpinStart}
              onSpinResult={handleSpinResult}
              result={result}
            />
          </section>

          <section className={styles['solo__right']} aria-label="지도 영역">
            <div className={styles['solo__map-section']}>
              <div className={styles['solo__map-header']}>
                <h2>지도</h2>
                <p>결과에 따라 지도가 업데이트 돼요!</p>
              </div>

              <div className={styles['solo__map-header__search']}>
                <BaseInput
                  ref={searchRef}
                  placeholder="장소를 검색해보세요"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
                <Button
                  type="button"
                  className={styles['solo__map-header__search-btn']}
                  onClick={handleSearch}
                  aria-label="검색"
                >
                  검색
                </Button>
              </div>

              <div className={styles['solo__map']}>
                <KakaoMap keyword={searchKeyword} list />
              </div>
            </div>
          </section>
        </div>

        <div className={styles['solo__stats-section']}>
          <div className={styles['solo__stats-header']}>
            <div>🎲</div>
            <h3 className={styles['solo__stats-header__title']}> 결과 내역</h3>
          </div>

          <div className={styles['solo__top-menu']}>
            <div className={styles['solo__top-menu__icon']}>📊</div>
            <div className={styles['solo__top-menu__info']}>
              <span className={styles['solo__top-menu__name']}>돌린횟수</span>
              <span className={styles['solo__top-menu__count']}>{roomResults.length} 회</span>
            </div>
          </div>

          <div className={styles['solo__mood-stats']}>
            <h4>최근 룰렛 결과</h4>

            <ul className={styles['solo__mood-stats__list__items']} role="list">
              {roomResults.slice(0, 8).map((item, idx) => {
                const isActive = favoriteMap[item.id] ?? false;

                return (
                  <li
                    key={`${item.id}-${idx}`}
                    className={styles['solo__mood-stats__list__items__item']}
                  >
                    <span className={styles['solo__mood-stats__list__items__item__badge']}>
                      {idx + 1}
                    </span>

                    <span>{item.name}</span>

                    <FavoriteToggle
                      isActive={isActive}
                      onToggle={() => handleFavoriteToggle(item.id)}
                      size={18}
                      ariaLabel={`${item.name} ${isActive ? '찜 해제' : '찜하기'}`}
                    />
                  </li>
                );
              })}

              {roomResults.length === 0 && (
                <li className={styles['solo__mood-stats__list__items__item--empty']}>
                  🎰 룰렛을 돌려보세요!
                </li>
              )}
            </ul>
          </div>

          <div className={styles['solo__time-info']}>
            <Clock size={18} />
            <span>
              {new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
