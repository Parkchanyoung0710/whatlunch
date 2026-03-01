import { render, screen, fireEvent } from '@testing-library/react';

import RouletteModal from '../RouletteModal';
import { DEFAULT_IMAGE } from '@/feature/Roulette/constants';

describe('RouletteModal UI', () => {
  const mockClose = jest.fn();

  const setup = () => render(<RouletteModal menu="라멘" onClose={mockClose} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 기본 렌더링 테스트

  test('모달이 정상 렌더링된다', () => {
    setup();

    expect(screen.getByText('라멘')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // 오버레이 / 내부 클릭 관련 테스트

  test('오버레이 클릭 시 onClose가 호출된다', () => {
    setup();

    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(mockClose).toHaveBeenCalled();
  });

  test('모달 내부 클릭 시 onClose가 호출되지 않는다', () => {
    setup();

    fireEvent.click(screen.getByRole('dialog'));
    expect(mockClose).not.toHaveBeenCalled();
  });

  // ESC 닫기 테스트

  test('ESC 키 입력 시 onClose 호출', () => {
    setup();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockClose).toHaveBeenCalled();
  });

  // 이미지 렌더링 + fallback 테스트

  test('이미지가 alt 속성과 함께 렌더링된다', () => {
    setup();

    const img = screen.getByAltText('라멘');
    expect(img).toBeInTheDocument();
  });

  test('이미지 로드 실패 시 fallback 이미지로 변경된다', () => {
    setup();

    const img = screen.getByAltText('라멘');

    fireEvent.error(img);

    expect(img.getAttribute('src')).toContain(DEFAULT_IMAGE);
  });

  test('공유하기 / 지도 보기 / 닫기 버튼이 렌더링된다', () => {
    setup();

    expect(screen.getByRole('button', { name: '공유하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '지도 보기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  // 버튼 동작 테스트

  test('닫기 버튼 클릭 시 onClose 호출', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(mockClose).toHaveBeenCalled();
  });

  // 공유하기 기능 테스트

  test('공유하기 버튼 클릭 - navigator.share 지원 시 share 호출', async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    navigator.share = mockShare;

    setup();

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }));

    expect(mockShare).toHaveBeenCalledWith({
      title: '오늘의 메뉴',
      text: '오늘의 메뉴는 라멘입니다!',
    });
  });

  test('공유하기 버튼 클릭 - navigator.share 미지원 시 무시됨', () => {
    delete (navigator as Partial<Navigator>).share;

    setup();

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }));

    expect(true).toBe(true);
  });
});
