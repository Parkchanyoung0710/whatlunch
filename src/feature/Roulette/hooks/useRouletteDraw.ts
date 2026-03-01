import { useCallback, useMemo } from 'react';

import { ROULETTE_STYLE } from '../constants/rouletteStyle';

const FULL_ANGLE = Math.PI * 2;

function getResponsiveTextStyle(size: number): { large: string; normal: string } {
  if (size < 300) {
    // 모바일
    return {
      large: '700 16px Pretendard, sans-serif',
      normal: '600 12px Pretendard, sans-serif',
    };
  } else if (size < 450) {
    // 태블릿
    return {
      large: '700 22px Pretendard, sans-serif',
      normal: '600 16px Pretendard, sans-serif',
    };
  } else {
    // 데스크톱
    return {
      large: '700 28px Pretendard, sans-serif',
      normal: '600 20px Pretendard, sans-serif',
    };
  }
}

export function useRouletteDraw(items: Menu.GetMenuRes[], size: number, sectorColors: string[]) {
  const radius = useMemo(() => size / 2, [size]);
  const responsiveText = useMemo(() => getResponsiveTextStyle(size), [size]);

  const stepAngle = useMemo(() => {
    return items.length > 0 ? FULL_ANGLE / items.length : 0;
  }, [items.length]);

  // 단일 메뉴 렌더링
  const drawSingleItem = useCallback(
    (canvasContext: CanvasRenderingContext2D) => {
      canvasContext.beginPath();
      canvasContext.fillStyle = sectorColors[0];
      canvasContext.arc(radius, radius, radius - 4, 0, FULL_ANGLE);
      canvasContext.fill();

      canvasContext.save();
      canvasContext.translate(radius, radius);
      canvasContext.fillStyle = ROULETTE_STYLE.text.color;
      canvasContext.font = responsiveText.large;
      canvasContext.textAlign = 'center';
      canvasContext.textBaseline = 'middle';
      canvasContext.fillText(items[0].name, 0, 0);
      canvasContext.restore();
    },
    [items, sectorColors, radius, responsiveText]
  );

  // 섹터 + 텍스트 렌더링
  const drawSectors = useCallback(
    (canvasContext: CanvasRenderingContext2D, angle: number) => {
      items.forEach((item, index) => {
        const start = angle + stepAngle * index;
        const end = start + stepAngle;

        // 섹터 배경
        canvasContext.beginPath();
        canvasContext.moveTo(radius, radius);
        canvasContext.fillStyle = sectorColors[index];
        canvasContext.arc(radius, radius, radius - 4, start, end);
        canvasContext.fill();

        // 경계선
        canvasContext.lineWidth = ROULETTE_STYLE.stroke.width;
        canvasContext.strokeStyle = ROULETTE_STYLE.stroke.color;
        canvasContext.stroke();

        // 텍스트
        canvasContext.save();
        canvasContext.translate(radius, radius);
        canvasContext.rotate(start + stepAngle / 2);

        canvasContext.fillStyle = ROULETTE_STYLE.text.color;
        canvasContext.font = responsiveText.normal;
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';

        // 글자가 뒤집히지 않도록 보정
        canvasContext.rotate(Math.PI);
        canvasContext.fillText(item.name, -radius * ROULETTE_STYLE.text.offsetRatio, 0);

        canvasContext.restore();
      });
    },
    [items, sectorColors, radius, stepAngle, responsiveText]
  );

  // 포인터 렌더링 (반응형 크기)
  const drawPointer = useCallback(
    (canvasContext: CanvasRenderingContext2D) => {
      canvasContext.save();
      canvasContext.translate(radius, radius);

      // 반응형 포인터 크기
      let pointerSize = ROULETTE_STYLE.pointer.responsive.mobile;
      if (size >= 450) {
        pointerSize = ROULETTE_STYLE.pointer.responsive.desktop;
      } else if (size >= 300) {
        pointerSize = ROULETTE_STYLE.pointer.responsive.tablet;
      }

      const edge = -(radius - ROULETTE_STYLE.pointer.margin);
      const triangleHeight = (pointerSize * Math.sqrt(3)) / 2;

      canvasContext.beginPath();
      canvasContext.moveTo(-pointerSize / 2, edge);
      canvasContext.lineTo(pointerSize / 2, edge);
      canvasContext.lineTo(0, edge + triangleHeight);
      canvasContext.closePath();
      canvasContext.fillStyle = ROULETTE_STYLE.pointer.color;
      canvasContext.fill();
      canvasContext.restore();
    },
    [radius, size]
  );

  // 전체 draw 함수
  const draw = useCallback(
    (canvasContext: CanvasRenderingContext2D, angle: number) => {
      canvasContext.clearRect(0, 0, size, size);

      if (items.length === 1) {
        drawSingleItem(canvasContext);
        return;
      }

      drawSectors(canvasContext, angle);
      drawPointer(canvasContext);
    },
    [items.length, size, drawSingleItem, drawSectors, drawPointer]
  );

  return draw;
}
