// 균등 분포된 HSL 색상 팔레트를 생성한다.
export function createHuePalette(count: number): string[] {
  if (count <= 0) return [];

  const palette: string[] = [];
  const gap = 360 / count; // 각 색상 간 Hue 간격

  for (let i = 0; i < count; i++) {
    const hue = i * gap;
    palette.push(`hsl(${hue}, 70%, 65%)`);
  }

  return palette;
}
