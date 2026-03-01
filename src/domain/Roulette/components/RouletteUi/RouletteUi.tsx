'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

import { getSocket, isSocketConnected } from '@/lib/socket';
import { useRouletteSync } from '../../hooks/useRouletteSync';
import { useSectorColors } from '@/domain/Roulette/hooks/useSectorColors';
import { useRouletteDraw } from '@/domain/Roulette/hooks/useRouletteDraw';
import { Category, Context } from '@/types/enum';

import styles from './RouletteUi.module.scss';

interface RouletteUiProps {
  items: Menu.GetMenuRes[];
  onStart: () => void;
  onResult: (item: Menu.GetMenuRes) => void;
  filters?: {
    category?: Category[];
    context?: Context[];
  };
  userRole?: 'host' | 'guest' | null;
  // size?: number;
  disabled?: boolean;
  menusReady?: boolean;
}

export default function RouletteUi({
  items,
  onStart,
  onResult,
  filters = {},
  userRole,
  // size = 480,
  disabled = false,
  menusReady = true,
}: RouletteUiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [size, setSize] = useState(480);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const params = useParams();
  const roomCode = (params?.roomId as string) || 'solo';
  const isSoloMode = roomCode === 'solo';

  /** 색상 */
  const sectorColors = useSectorColors(items);

  /** draw 함수 */
  const draw = useRouletteDraw(items, size, sectorColors);

  /** 동기화 스핀 훅 */
  const { startSyncedSpin } = useRouletteSync({
    setAngle,
    setSpinning,
    onResult,
    items,
  });

  /** 서버에서 스핀 시작 수신 (id 기반 결과 동기화) */
  useEffect(() => {
    if (isSoloMode) return;

    const socket = getSocket();
    if (!socket) return;

    const handleRouletteSpin = ({
      // menus,
      finalRotation,
      duration,
    }: {
      menus: Menu.GetMenuRes[];
      finalRotation: number;
      duration: number;
    }) => {
      // 서버에서 받은 menus로 상태 갱신(필요시)
      startSyncedSpin(finalRotation, duration);
    };

    socket.on('rouletteSpin', handleRouletteSpin);

    return () => {
      socket.off('rouletteSpin', handleRouletteSpin);
    };
  }, [isSoloMode, startSyncedSpin]);

  /** canvas context 초기화 */
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
  }, []);

  /** angle 변경 시 다시 그림 */
  useEffect(() => {
    if (!ctxRef.current) return;
    draw(ctxRef.current, angle);
  }, [angle, draw]);

  useEffect(() => {
    if (spinning) {
    }
  }, [items, spinning]);

  /** 클릭 핸들러 (host만 가능) */
  const handleSpin = useCallback(() => {
    if (spinning || items.length !== 6 || disabled || !menusReady) return;

    if (!isSoloMode && userRole !== 'host') return;

    if (isSoloMode) {
      onStart();

      const randomIndex = Math.floor(Math.random() * items.length);
      const baseRotation = Math.PI * 2 * (8 + Math.random() * 4); // 8~12바퀴
      const step = (Math.PI * 2) / items.length;
      const itemAngle = step * randomIndex;
      const finalRotation = baseRotation + itemAngle;

      startSyncedSpin(finalRotation, 5000);
    } else {
      if (!isSocketConnected()) {
        console.warn('[룰렛] Socket 미연결');
        return;
      }

      const socket = getSocket();
      if (socket) {
        socket.emit('spinRoulette', {
          roomCode,
          filters: {
            category: filters.category,
            context: filters.context,
          },
        });
        onStart();
      }
    }
  }, [
    spinning,
    items,
    isSoloMode,
    userRole,
    onStart,
    startSyncedSpin,
    roomCode,
    filters,
    disabled,
    menusReady,
  ]);

  // 화면 크기 변경 대응
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (spinning) return;
      const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
      const newSize = Math.floor(smallerDimension * 0.4);
      const clampedSize = Math.max(200, Math.min(600, newSize));
      setSize(clampedSize);
    };

    const debouncedResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [spinning]);

  const canvasClass = spinning
    ? `${styles['roulette-ui__canvas']} ${styles['roulette-ui__canvas--spinning']}`
    : styles['roulette-ui__canvas'];

  return (
    <div className={styles['roulette-ui']}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={canvasClass}
        onClick={handleSpin}
        role="button"
        tabIndex={0}
        aria-label="룰렛을 돌리려면 클릭하세요"
        onKeyDown={e => {
          if (!spinning && !disabled && e.key === 'Enter') {
            e.preventDefault();
            handleSpin();
          }
        }}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      />
    </div>
  );
}
