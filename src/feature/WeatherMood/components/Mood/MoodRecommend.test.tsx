import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import MoodRecommend from './MoodRecommend';

// utils mock
jest.mock('@/domain/WeatherMood/components/Mood/utils/moodRecommend', () => ({
  moodOptions: [
    { id: 'happy', label: '행복', icon: '😊' },
    { id: 'sad', label: '우울', icon: '😢' },
  ],
  getMoodBaseMenus: jest.fn((moodId: string) => {
    if (moodId === 'happy') return ['피자', '햄버거'];
    if (moodId === 'sad') return ['죽', '국밥'];
    return [];
  }),
}));

jest.mock('@/domain/WeatherMood/components/Mood/utils/recommendEngine', () => ({
  generateRecommendations: jest.fn((menus: string[]) => menus),
}));

describe('MoodRecommend 테스트', () => {
  it('기본 기분(happy)으로 렌더링된다', () => {
    render(<MoodRecommend />);

    expect(screen.getByText('행복')).toBeInTheDocument();
    expect(screen.getByText('피자')).toBeInTheDocument();
    expect(screen.getByText('햄버거')).toBeInTheDocument();
  });

  it('기분 버튼들이 렌더링된다', () => {
    render(<MoodRecommend />);

    expect(screen.getByText('행복')).toBeInTheDocument();
    expect(screen.getByText('우울')).toBeInTheDocument();
  });

  it('기분 버튼 클릭 시 추천 메뉴가 변경된다', () => {
    render(<MoodRecommend />);

    // sad 버튼 클릭
    fireEvent.click(screen.getByText('우울'));

    // sad에 맞는 메뉴 표시
    expect(screen.getByText('죽')).toBeInTheDocument();
    expect(screen.getByText('국밥')).toBeInTheDocument();

    // 이전 메뉴는 사라짐
    expect(screen.queryByText('피자')).not.toBeInTheDocument();
  });
});
