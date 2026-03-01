// Fisher–Yates 알고리즘으로 배열을 무작위 순서로 섞음
export function shuffleArray<T>(arr: readonly T[]): T[] {
  const shuffled = [...arr];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// 중복 제거 후 무작위로 최대 count개 선택
export function pickRandomUnique<T>(items: readonly T[], count: number): T[] {
  const unique = Array.from(new Set(items));
  return shuffleArray(unique).slice(0, Math.min(count, unique.length));
}
