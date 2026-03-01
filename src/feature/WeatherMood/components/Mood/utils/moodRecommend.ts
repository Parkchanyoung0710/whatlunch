export const MOOD_KEYS = ['happy', 'normal', 'sad', 'angry', 'tired'] as const;

// 기분 ID 타입 자동 추출
export type MoodId = (typeof MOOD_KEYS)[number];

// 기분 메타데이터 아이템 타입
export interface MoodMetaItem {
  label: string;
  icon: string;
  menus: readonly string[]; // UI/추천 로직에서 불변 데이터로 사용
}

// label, icon : UI 표시용
export const MOOD_META = {
  happy: {
    label: '기쁨',
    icon: '😊',
    menus: ['초밥', '파스타', '스테이크', '피자', '비빔밥', '타코야키'],
  },

  normal: {
    label: '보통',
    icon: '🙂',
    menus: ['김밥', '우동', '짜장면', '햄버거', '파스타', '샐러드'],
  },

  sad: {
    label: '우울',
    icon: '😢',
    menus: ['순두부찌개', '국밥', '마파두부', '떡국', '리조또', '라자냐'],
  },

  angry: {
    label: '화남',
    icon: '😡',
    menus: ['떡볶이', '짬뽕', '깐풍기', '닭강정', '탕수육', '동파육'],
  },

  tired: {
    label: '피곤',
    icon: '😴',
    menus: ['샐러드', '규동', '유산슬', '우동', '냉면', '잡채'],
  },
} as const satisfies Record<MoodId, MoodMetaItem>;

// UI에서 바로 사용하는 기분 옵션 타입
export interface MoodOption {
  id: MoodId;
  label: string;
  icon: string;
}

// UI 선택용 기분 옵션 배열
export const moodOptions: MoodOption[] = MOOD_KEYS.map(id => ({
  id,
  label: MOOD_META[id].label,
  icon: MOOD_META[id].icon,
}));

// 기분별 기본 메뉴 목록 반환
export function getMoodBaseMenus(mood: MoodId): string[] {
  return [...MOOD_META[mood].menus];
}
