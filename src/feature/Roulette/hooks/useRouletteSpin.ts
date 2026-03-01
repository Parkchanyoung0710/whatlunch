import { useEffect, useRef, useCallback } from 'react';

import { calculateSectorIndex } from '../core/calculateSectorIndex';
import { randomSpinOffset } from '../core/rouletteRandom';

export interface UseRouletteSpinProps {
  items: Menu.GetMenuRes[];
  angle: number;
  setAngle: React.Dispatch<React.SetStateAction<number>>;
  spinning: boolean;
  setSpinning: React.Dispatch<React.SetStateAction<boolean>>;
  onResult?: (item: Menu.GetMenuRes) => void;
  onStart?: () => void;
}

// 내부 물리 설정
const MAX_VELOCITY = 1.1;
const ACCELERATION = 0.06;
const FRICTION = 0.985;
const STOP_THRESHOLD = 0.002;

export function useRouletteSpin({
  items,
  angle,
  setAngle,
  spinning,
  setSpinning,
  onResult,
  onStart,
}: UseRouletteSpinProps) {
  const rafRef = useRef<number | null>(null);
  const currentAngleRef = useRef(angle);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    currentAngleRef.current = angle;
  }, [angle]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const canSpin = items.length > 0 && !spinning;

  const spin = useCallback(() => {
    if (!canSpin) return;

    setSpinning(true);
    onStart?.();

    // 아이템 1개면 즉시 반환
    if (items.length === 1) {
      setSpinning(false);
      onResult?.(items[0]);
      return;
    }

    let velocity = 0;
    let phase: 'accel' | 'decel' = 'accel';

    currentAngleRef.current += randomSpinOffset();
    lastTimeRef.current = null;

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;

      const delta = (timestamp - lastTimeRef.current) / 16;
      lastTimeRef.current = timestamp;

      if (phase === 'accel') {
        velocity += ACCELERATION * delta;
        if (velocity >= MAX_VELOCITY) phase = 'decel';
      } else {
        velocity *= Math.pow(FRICTION, delta);
        if (velocity < STOP_THRESHOLD) {
          setSpinning(false);
          const index = calculateSectorIndex(currentAngleRef.current, items.length);
          onResult?.(items[index]);
          return;
        }
      }

      currentAngleRef.current += velocity * delta;
      setAngle(currentAngleRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [canSpin, items, onResult, onStart, setAngle, setSpinning]);

  return spin;
}
