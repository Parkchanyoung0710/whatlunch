import { render, screen, fireEvent } from '@testing-library/react';

import RouletteFilter from '../RouletteFilter';

import { pickMenus } from '@/domain/Roulette/core/pickMenus';

// pickMenus mock
jest.mock('@/domain/Roulette/core/pickMenus', () => ({
  pickMenus: jest.fn(() => ['메뉴A', '메뉴B']),
}));

// 필터 설정 mock
jest.mock('@/domain/Roulette/constants', () => ({
  FILTER_FULL_CONFIG: {
    food: {
      label: '음식 종류',
      options: [
        { value: 'all', label: '전체' },
        { value: 'korean', label: '한식' },
        { value: 'chinese', label: '중식' },
      ],
      icons: {
        all: 'ICON_ALL',
        korean: 'ICON_KOREAN',
        chinese: 'ICON_CHINESE',
      },
    },
    situation: {
      label: '상황별',
      options: [
        { value: 'lunch', label: '점심' },
        { value: 'solo', label: '혼밥' },
      ],
      icons: {
        lunch: 'ICON_LUNCH',
        solo: 'ICON_SOLO',
      },
    },
  },
}));

describe('RouletteFilter UI 동작 테스트', () => {
  const mockChange = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  const setup = () => render(<RouletteFilter onChange={mockChange} />);

  test('초기 음식 필터가 렌더링된다', () => {
    setup();
    expect(screen.getByRole('button', { name: /전체/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /한식/ })).toBeInTheDocument();
  });

  test('음식 옵션 클릭 시 pickMenus와 onChange가 호출된다', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /한식/ }));
    expect(pickMenus).toHaveBeenCalled();
    expect(mockChange).toHaveBeenCalledWith(['메뉴A', '메뉴B']);
  });

  test('음식 옵션 클릭 시 버튼은 활성화 상태가 된다', () => {
    setup();
    const btn = screen.getByRole('button', { name: /한식/ });
    fireEvent.click(btn);
    expect(btn).toHaveClass('button--fill');
  });

  test('전체 클릭 시 음식 선택이 초기화된다', () => {
    setup();

    const pickMenusMock = pickMenus as jest.Mock;
    const initial = pickMenusMock.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: /한식/ }));
    fireEvent.click(screen.getByRole('button', { name: /전체/ }));

    expect(pickMenusMock.mock.calls.length).toBe(initial + 2);
  });

  test('상황별 탭 전환 시 상황 옵션 목록이 보인다', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: '상황별' }));
    expect(screen.getByRole('button', { name: /점심/ })).toBeInTheDocument();
  });

  test('모드 전환 시 food 활성 상태는 초기화된다', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /한식/ }));
    fireEvent.click(screen.getByRole('button', { name: '상황별' }));
    fireEvent.click(screen.getByRole('button', { name: '음식 종류' }));
    expect(screen.getByRole('button', { name: /한식/ })).toHaveClass('button--outline');
  });

  test('disabled 상태에서는 동작하지 않는다', () => {
    const mockChange = jest.fn();
    render(<RouletteFilter onChange={mockChange} disabled />);

    // 초기 렌더링 시 pickMenus는 자동으로 1번 호출됨
    expect(pickMenus).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /한식/ }));

    // disabled 상태에서는 pickMenus 추가 호출이 없어야 함
    expect(pickMenus).toHaveBeenCalledTimes(1);
  });

  test('옵션 목록은 FILTER_CONFIG에 의해 결정된다', () => {
    setup();
    expect(screen.getByRole('button', { name: /중식/ })).toBeInTheDocument();
  });

  test('전체 선택 시 pickMenus(null, null)을 호출한다', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /전체/ }));
    expect(pickMenus).toHaveBeenCalledWith(null, null);
  });

  test('두 개 이상의 음식 타입 선택 시 배열로 전달된다', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /한식/ }));
    fireEvent.click(screen.getByRole('button', { name: /중식/ }));
    expect(pickMenus).toHaveBeenLastCalledWith(['korean', 'chinese'], null);
  });

  test('상황 선택 시 situation 값만 전달된다', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: '상황별' }));
    fireEvent.click(screen.getByRole('button', { name: /혼밥/ }));
    expect(pickMenus).toHaveBeenCalledWith(null, 'solo');
  });
});
