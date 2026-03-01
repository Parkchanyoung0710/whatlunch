import { useRef, useCallback } from 'react';
import { calculateSectorIndex } from '../core/calculateSectorIndex';

interface UseRouletteSyncProps {
  setAngle: (angle: number) => void;
  setSpinning: (spinning: boolean) => void;
  onResult: (item: Menu.GetMenuRes) => void;
  items: Menu.GetMenuRes[];
}

/**
 * 서버에서 받은 회전 각도와 시간으로 정확한 애니메이션 동기화
 * - 항상 angle을 0에서 시작 (속도 저하 방지)
 * - 애니메이션 종료 후, 실제 가리키는 섹터 index로 result를 계산해 모달과 100% 동기화
 */
export function useRouletteSync({ setAngle, setSpinning, onResult, items }: UseRouletteSyncProps) {
  // 서버에서 selectedIndex를 전달받으면 그 값만 사용해서 모달을 한 번만 띄움
  const resultHandledRef = useRef(false);

  // 서버에서 menus, finalRotation, duration만 전달받음
  // 애니메이션 종료 후 각도 기준으로 결과 계산
  const startSyncedSpin = useCallback(
    (finalRotation: number, duration: number) => {
      setSpinning(true);
      setAngle(0);
      const startTime = Date.now();
      const startAngle = 0;
      resultHandledRef.current = false;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentAngle = startAngle + (finalRotation - startAngle) * easeProgress;
        setAngle(currentAngle);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          const FULL_ANGLE = Math.PI * 2;
          const normalized = ((finalRotation % FULL_ANGLE) + FULL_ANGLE) % FULL_ANGLE;
          setAngle(normalized);
          setSpinning(false);

          // 애니메이션 종료 후 각도 기준으로 결과 계산
          if (!resultHandledRef.current && items.length > 0) {
            resultHandledRef.current = true;
            const index = calculateSectorIndex(normalized, items.length);
            onResult(items[index]);
          }
        }
      };

      requestAnimationFrame(animate);
    },
    [setAngle, setSpinning, onResult, items]
  );

  return { startSyncedSpin };
}
