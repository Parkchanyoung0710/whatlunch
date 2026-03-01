// 배열을 균등하게 무작위 섞는 함수(Fisher–Yates)
export function shuffleMenus<T>(menus: T[]): T[] {
  const shuffled = [...menus]; // 원본 배열은 유지하고 새 배열에서 섞기

  for (let current = shuffled.length - 1; current > 0; current--) {
    const random = Math.floor(Math.random() * (current + 1)); // 0 ~ current 중 랜덤 선택
    [shuffled[current], shuffled[random]] = [shuffled[random], shuffled[current]]; // 스왑
  }

  return shuffled;
}
