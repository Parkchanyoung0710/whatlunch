// 추천 기준 시간대(아침/저녁)
export type TimeSlot = 'morning' | 'evening';

// 현재 시각을 기준으로 추천 시간대 계산
export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 18) return 'morning'; // 저녁
  return 'evening'; // 아침
}
