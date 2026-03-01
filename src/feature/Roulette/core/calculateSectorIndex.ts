// 회전한 룰렛의 현재 angle을 기준으로 선택된 섹터 index를 계산하는 함수
export function calculateSectorIndex(angle: number, itemCount: number): number {
  const full = 2 * Math.PI;
  const step = full / itemCount;

  // angle을 0~2π 범위로 정규화
  let normalized = ((angle % full) + full) % full;

  // 기준점을 12시로 설정
  normalized = (normalized + Math.PI / 2) % full;

  // 룰렛은 시계 방향 회전이므로 각도 방향을 반대로 변환
  const clockwise = (full - normalized) % full;

  // 현재 각도가 어느 섹터에 해당하는지 계산
  return Math.floor(clockwise / step);
}
