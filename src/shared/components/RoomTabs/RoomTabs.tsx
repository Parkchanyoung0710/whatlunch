'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';

import Roulette from '@/domain/Roulette';

import { useRouletteResultStore } from '@/shared/stores/rouletteResultStore';
import { getSocket } from '@/lib/socket';

interface RoomTabsProps {
  userRole?: 'host' | 'guest' | null;
  initialMenus?: Menu.GetMenuRes[];
  onResult?: (result: Menu.GetMenuRes) => void;
}

export default function RoomTabs({ userRole, initialMenus = [], onResult }: RoomTabsProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<Menu.GetMenuRes | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const params = useParams();
  const roomCode = (params?.roomId as string) || 'solo';
  const isSoloMode = roomCode === 'solo';

  // 룸별 독립적인 결과 저장소
  const { addResult, setCurrentRoom } = useRouletteResultStore();

  // 현재 룸 설정
  useEffect(() => {
    setCurrentRoom(roomCode);
  }, [roomCode, setCurrentRoom]);

  // ============ WebSocket 이벤트 리스너 설정 ============
  useEffect(() => {
    if (isSoloMode) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    // 호스트/게스트 역할 요청 (재접속 시에도)
    socket.emit('joinRoom', { roomCode, role: userRole });

    // 룰렛 회전 시작
    const handleRouletteSpinStarted = () => {
      setIsSpinning(true);
    };

    // 상태 동기화
    const handleRouletteStateSync = ({
      state,
    }: {
      state: {
        isSpinning: boolean;
        result: Menu.GetMenuRes | null;
      };
    }) => {
      setIsSpinning(state.isSpinning);
      if (state.result) {
        setRouletteResult(state.result);
        if (searchRef.current) {
          searchRef.current.value = state.result.name ?? '';
        }
      } else {
        setRouletteResult(null);
        if (searchRef.current) {
          searchRef.current.value = '';
        }
      }
    };

    // 이벤트 리스너 등록
    socket.on('rouletteSpinStarted', handleRouletteSpinStarted);
    socket.on('rouletteStateSync', handleRouletteStateSync);

    // 현재 상태 요청 (재접속 시 동기화)
    const timeoutId = setTimeout(() => {
      socket.emit('requestRouletteState', { roomCode });
    }, 500);

    return () => {
      // socket.off('tabSync', handleTabSync);
      socket.off('rouletteSpinStarted', handleRouletteSpinStarted);
      socket.off('rouletteStateSync', handleRouletteStateSync);
      clearTimeout(timeoutId);
    };
  }, [roomCode, isSoloMode, userRole]);

  const handleRouletteStart = useCallback(() => {
    setIsSpinning(true);
  }, []);

  const handleRouletteResultLocal = useCallback(
    (result: Menu.GetMenuRes | null) => {
      if (result !== null) {
        setIsSpinning(false);
      }
      setRouletteResult(result);

      if (searchRef.current) {
        searchRef.current.value = result?.name ?? '';
      }

      // 룸별 결과 저장
      if (result) addResult(roomCode, [result]);
      // 부모 컴포넌트에 결과 전파
      if (onResult && result) {
        onResult(result);
      }
    },
    [roomCode, addResult, onResult]
  );

  if (!userRole) return null;

  return (
    <Roulette
      isSpinning={isSpinning}
      onSpinStart={handleRouletteStart}
      onSpinResult={handleRouletteResultLocal}
      result={rouletteResult}
      userRole={userRole}
      initialMenus={initialMenus}
    />
  );
}
