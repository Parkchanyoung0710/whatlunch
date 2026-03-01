import { render, screen, fireEvent, act } from '@testing-library/react';

import RouletteUi from '../RouletteUi';

import { MenuItem } from '@/domain/Roulette/utils/menuItem';

jest.useFakeTimers();

const mockItems: MenuItem[] = [
  { id: 1, name: 'A', type: 'korean', situations: ['lunch'] },
  { id: 2, name: 'B', type: 'japanese', situations: ['solo'] },
];

const setup = (props = {}) =>
  render(<RouletteUi items={mockItems} onStart={() => {}} onResult={() => {}} {...props} />);

describe('RouletteUi Component', () => {
  test('Canvas 렌더링됨', () => {
    setup();
    const canvas = screen.getByRole('button', { name: '룰렛을 돌리려면 클릭하세요' });
    expect(canvas).toBeInTheDocument();
  });

  test('onStart가 호출됨', () => {
    const onStart = jest.fn();
    setup({ onStart });

    fireEvent.click(screen.getByRole('button', { name: '룰렛을 돌리려면 클릭하세요' }));
    expect(onStart).toHaveBeenCalled();
  });

  test('스핀 중에는 onStart가 다시 호출되지 않음', () => {
    const onStart = jest.fn();
    setup({ onStart });

    const canvas = screen.getByRole('button', { name: '룰렛을 돌리려면 클릭하세요' });

    fireEvent.click(canvas);
    fireEvent.click(canvas); // 두 번째 클릭 무시

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test('스핀 후 onResult가 MenuItem.name(A/B)을 반환한다', () => {
    const onResult = jest.fn();
    setup({ onResult });

    fireEvent.click(screen.getByRole('button', { name: '룰렛을 돌리려면 클릭하세요' }));

    act(() => {
      jest.runAllTimers();
    });

    expect(onResult).toHaveBeenCalled();

    const resultItem = onResult.mock.calls[0][0];
    expect(['A', 'B']).toContain(resultItem.name);
  });
});
