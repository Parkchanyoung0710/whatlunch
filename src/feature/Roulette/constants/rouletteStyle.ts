export const ROULETTE_STYLE = {
  text: {
    color: '#334155',
    large: '700 28px Pretendard, sans-serif',
    normal: '600 20px Pretendard, sans-serif',
    offsetRatio: 0.5,
  },

  stroke: {
    color: 'rgba(0, 0, 0, 0.18)',
    width: 2,
  },

  pointer: {
    color: '#ef4444',
    size: 48,
    margin: 4,
    responsive: {
      mobile: 24 as number,
      tablet: 32 as number,
      desktop: 48 as number,
    },
  },

  wheel: {
    borderRadius: 9999,
    innerShadow: 'inset 0 0 25px rgba(0,0,0,0.2)',
    outerShadow: '0 10px 25px rgba(0,0,0,0.25)',
    background: {
      start: '#ffffff',
      end: '#e5e7eb',
    },
  },
} as const;
