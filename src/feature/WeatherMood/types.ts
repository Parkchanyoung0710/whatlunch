export const TAB_KEYS = ['weather', 'mood'] as const;

export type TabKey = (typeof TAB_KEYS)[number];

// 탭에 필요한 정보
export interface TabMeta {
  label: string;

  // props 없는 함수형 컴포넌트만 허용
  Component: () => JSX.Element;
}
