export interface RouletteControllerProps {
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinResult: (item: Menu.GetMenuRes | null) => void;
  userRole?: 'host' | 'guest' | null;
  initialMenus?: Menu.GetMenuRes[];
  result: Menu.GetMenuRes | null;
}
