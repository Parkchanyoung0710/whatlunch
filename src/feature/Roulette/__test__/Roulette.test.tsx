import { render, screen, fireEvent } from '@testing-library/react';

import Roulette from '../Roulette';

jest.useFakeTimers();

// 룰렛 필터 Mock
jest.mock('../components/RouletteFilter', () => {
  return {
    __esModule: true,
    default: ({
      onChange,
      disabled,
    }: {
      onChange: (items: { name: string }[]) => void;
      disabled: boolean;
    }) => (
      <button
        data-testid="filter-btn"
        disabled={disabled}
        onClick={() =>
          !disabled && onChange([{ name: '라면' }, { name: '돈까스' }, { name: '파스타' }])
        }
      >
        필터 변경
      </button>
    ),
  };
});

// 룰렛 UI Mock
jest.mock('../components/RouletteUi', () => {
  return {
    __esModule: true,
    default: ({
      items,
      onStart,
      onResult,
    }: {
      items: { name: string }[];
      onStart?: () => void;
      onResult: (item: { name: string }) => void;
    }) =>
      items.length > 1 ? (
        <button
          data-testid="spin-btn"
          onClick={() => {
            onStart?.();
            onResult({ name: '라면' }); // 실제 Roulette가 요구하는 구조
          }}
        >
          Spin
        </button>
      ) : null,
  };
});

// 룰렛 모달 Mock
jest.mock('../components/RouletteModal', () => {
  return {
    __esModule: true,
    default: ({ menu }: { menu: string }) => (
      <div data-testid="modal">
        <p>결과: {menu}</p>
      </div>
    ),
  };
});

// 헬퍼
const setup = (props = {}) =>
  render(<Roulette isSpinning={false} onSpinStart={() => {}} onSpinResult={() => {}} {...props} />);

describe('Roulette 통합 테스트', () => {
  /* 초기 필터 → Spin 버튼 노출 */
  test('필터 변경 시 메뉴가 설정되고 Spin 버튼 노출', () => {
    setup();

    fireEvent.click(screen.getByTestId('filter-btn'));

    expect(screen.getByTestId('spin-btn')).toBeInTheDocument();
  });

  /* Spin → onSpinStart / onSpinResult 호출 */
  test('Spin 클릭 시 onSpinStart / onSpinResult 호출', () => {
    const onStart = jest.fn();
    const onResult = jest.fn();

    setup({ onSpinStart: onStart, onSpinResult: onResult });

    fireEvent.click(screen.getByTestId('filter-btn'));
    fireEvent.click(screen.getByTestId('spin-btn'));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('라면');
  });

  test('Spin 실행 후 결과 모달이 열린다', () => {
    setup();

    fireEvent.click(screen.getByTestId('filter-btn'));
    fireEvent.click(screen.getByTestId('spin-btn'));

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('결과: 라면')).toBeInTheDocument();
  });

  test('스핀 중에는 필터 버튼 비활성화', () => {
    setup({ isSpinning: true });

    const filterBtn = screen.getByTestId('filter-btn');

    expect(filterBtn).toBeDisabled();

    fireEvent.click(filterBtn);
    expect(screen.queryByTestId('spin-btn')).not.toBeInTheDocument();
  });

  // shuffle 버튼 활성화 여부
  test('셔플 버튼은 메뉴가 2개 이상일 때만 활성화된다', () => {
    setup();

    // 초기 = disabled
    const shuffleBtn = screen.getByRole('button', { name: '' });
    expect(shuffleBtn).toBeDisabled();

    fireEvent.click(screen.getByTestId('filter-btn'));
    expect(shuffleBtn).toBeEnabled();
  });

  // 결과 보기 버튼 disabled
  test('결과가 없을 때 결과 보기 버튼은 비활성화된다', () => {
    setup();

    const resultBtn = screen.getByText('결과 보기');
    expect(resultBtn).toBeDisabled();
  });

  // 메뉴 수가 2개 미만일 때 Spin 버튼 없음
  test('menus.length < 2일 때 Spin 버튼이 나타나지 않는다', () => {
    setup();

    expect(screen.queryByTestId('spin-btn')).not.toBeInTheDocument();
  });
});
