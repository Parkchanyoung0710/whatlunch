import type { MenuSummaryData, MenuSummaryItem } from './types';

export const MENU_SUMMARY_MOCK = {
  items: [
    { type: 'mealTier', title: '평균 식사 기준', value: '보통 한 끼 식사를 가장 자주 선택해요.' },
    { type: 'time', title: '선호하는 시간대', value: '주로 저녁 시간대(18:00~20:00)에 식사해요.' },
    { type: 'style', title: '식사 스타일', value: '혼밥 위주의 식사 패턴이에요.' },
  ] as MenuSummaryItem[], // // items가 빈 배열일 때 never[]로 추론되는 문제 방지
} satisfies MenuSummaryData;
