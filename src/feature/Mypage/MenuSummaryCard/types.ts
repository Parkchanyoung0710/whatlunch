export type MenuSummaryItemType = 'category' | 'mealTier' | 'time' | 'style';

export type MenuSummaryItem = {
  type: MenuSummaryItemType; // 화면에서 쓰는 고정 항목 타입
  title: string; // 항목 제목(화면 표시용)
  value: string; // API 데이터를 가공해 만든 화면용 문장
  percentage?: number; // API에서 카테고리 비율 값(%)
};

export type MenuSummaryData = {
  items: MenuSummaryItem[]; // API 데이터를 가공해 만든 요약 항목들
};
