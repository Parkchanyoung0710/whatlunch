export interface RouletteUiProps {
  items: Menu.GetMenuRes[]; // 룰렛에 표시될 항목 목록
  onResult?: (item: Menu.GetMenuRes) => void; // 룰렛이 멈췄을 때 선택된 항목을 전달하는 콜백
  onStart?: () => void; // 룰렛이 회전 시작할 때 호출되는 콜백
  size?: number;
}
