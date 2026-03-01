'use client';

import { memo, useCallback, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import Button from '@/shared/components/Button';
import RouletteFilter from './components/RouletteFilter';
import RouletteUi from './components/RouletteUi';
import RouletteModal from './components/RouletteModal';
import Loading from '@/shared/components/Loading';

import { getSocket } from '@/lib/socket';
import { Category, Context } from '@/types/enum';

import type { RouletteControllerProps } from './types';
import styles from './Roulette.module.scss';

export const Roulette = memo(function Roulette({
  onSpinResult,
  onSpinStart,
  userRole,
  initialMenus = [],
  isSpinning = false,
}: RouletteControllerProps) {
  const [menus, setMenus] = useState<Menu.GetMenuRes[]>(initialMenus);
  const [spinning, setSpinning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    category?: Category[];
    context?: Context[];
  }>({});
  const [localResult, setLocalResult] = useState<Menu.GetMenuRes | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 게스트용 동기화된 필터 상태
  const [syncedFilterState, setSyncedFilterState] = useState<{
    mode: 'category' | 'context';
    selectedFoodTypes: Category | null;
    selectedSituation: Context | null;
    timestamp?: number;
    updatedBy?: string;
  } | null>(null);

  const params = useParams();
  const roomCode = (params?.roomId as string) || 'solo';
  const isSoloMode = roomCode === 'solo';

  // 최초 입장/재입장 시 서버 menus만 사용
  useEffect(() => {
    if (initialMenus && initialMenus.length > 0) {
      setMenus(initialMenus);
    }
  }, [initialMenus]);

  useEffect(() => {
    if (isSoloMode) return;

    const socket = getSocket();
    if (!socket) return;

    // 연결 성공 시 사용자 ID 저장
    const handleConnected = (payload?: { user?: { _id?: string; id?: string } }) => {
      if (!payload?.user) return;

      const { user } = payload;
      const userId = user.id || user._id;
      if (userId) {
        setCurrentUserId(userId);
      }
    };

    const handleMenusSync = ({ menus }: { menus: Menu.GetMenuRes[] }) => {
      setMenus(menus);
    };

    // 역할 할당 이벤트 (호스트/게스트 역할 부여)
    const handleRoleAssigned = ({
      menus,
      user,
    }: {
      role: string;
      menus: Menu.GetMenuRes[];
      user?: { _id?: string; id?: string };
    }) => {
      // 사용자 ID 저장
      if (user) {
        const userId = user.id || user._id;
        if (userId) {
          setCurrentUserId(userId);
        }
      }
      if (menus && menus.length > 0) {
        setMenus(menus);
      }
    };

    // 필터 업데이트 이벤트 (호스트와 게스트 모두)
    const handleFiltersUpdated = ({
      filters,
      mode,
      selectedFoodTypes,
      selectedSituation,
      updatedBy,
      timestamp,
      menus,
    }: {
      filters: { category?: Category[]; context?: Context[] };
      mode: 'category' | 'context';
      selectedFoodTypes: Category | null;
      selectedSituation: Context | null;
      updatedBy: string;
      timestamp?: number;
      menus: Menu.GetMenuRes[];
    }) => {
      setFilters(filters);
      setSyncedFilterState({
        mode,
        selectedFoodTypes,
        selectedSituation,
        timestamp,
        updatedBy,
      });
      setMenus(menus);
    };

    socket.on('connected', handleConnected);
    socket.on('menusSync', handleMenusSync);
    socket.on('roleAssigned', handleRoleAssigned);
    socket.on('rouletteFiltersUpdated', handleFiltersUpdated);

    return () => {
      socket.off('connected', handleConnected);
      socket.off('menusSync', handleMenusSync);
      socket.off('roleAssigned', handleRoleAssigned);
      socket.off('rouletteFiltersUpdated', handleFiltersUpdated);
    };
  }, [isSoloMode]);

  const handleFiltersChange = useCallback(
    (
      newFilters: { category?: Category[]; context?: Context[] },
      mode: 'category' | 'context',
      selectedFoodTypes: Category | null,
      selectedSituation: Context | null
    ) => {
      setFilters(newFilters);
      // 호스트가 필터를 변경할 때만 소켓으로 전송
      if (!isSoloMode && userRole === 'host') {
        const socket = getSocket();
        if (socket) {
          socket.emit('updateRouletteFilters', {
            roomCode,
            filters: newFilters,
            mode,
            selectedFoodTypes,
            selectedSituation,
          });
        }
      }
    },
    [roomCode, isSoloMode, userRole]
  );

  const handleResult = useCallback(
    (item: Menu.GetMenuRes) => {
      setLocalResult(item);
      setModalOpen(true);
      onSpinResult(item);
      setSpinning(false);
    },
    [onSpinResult]
  );

  const handleSpinStart = useCallback(() => {
    setLocalResult(null);
    setModalOpen(false);
    onSpinStart?.();
    onSpinResult(null);
    setSpinning(true);
  }, [onSpinStart, onSpinResult]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div className={styles['roulette']}>
      <p className={styles['roulette__today']}>
        오늘의 메뉴 {localResult ? <span>{localResult.name} !</span> : <span>?</span>}
      </p>

      <div className={styles['roulette__wheel-wrapper']}>
        {isSoloMode && menus.length === 0 ? (
          <Loading />
        ) : (
          <RouletteUi
            items={menus}
            onStart={handleSpinStart}
            onResult={handleResult}
            filters={filters}
            userRole={userRole}
          />
        )}
      </div>

      <div className={styles['roulette__result-btn']}>
        <Button
          disabled={!localResult}
          onClick={() => setModalOpen(true)}
          className={styles['roulette__result-btn__button']}
        >
          결과 보기
        </Button>
      </div>

      {(isSoloMode || userRole === 'host') && (
        <RouletteFilter
          onChange={setMenus}
          onFiltersChange={userRole === 'host' || isSoloMode ? handleFiltersChange : undefined}
          disabled={(userRole !== 'host' && !isSoloMode) || spinning || isSpinning}
          syncedFilterState={syncedFilterState}
          currentUserId={currentUserId}
          isVisible={true}
        />
      )}

      {modalOpen && localResult && (
        <RouletteModal menu={localResult} onClose={handleCloseModal} roomCode={roomCode} />
      )}
    </div>
  );
});

export default Roulette;
