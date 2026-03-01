jest.mock('@/domain/WeatherMood/WeatherMood.module.scss', () => ({}), { virtual: true }); // 이 테스트에서만 스타일 무시

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import WeatherMood from '../WeatherMood';

jest.mock('@/domain/WeatherMood/components/Weather/WeatherRecommend', () => ({
  __esModule: true,
  default: () => <div>WeatherRecommend Component</div>,
}));

jest.mock('@/domain/WeatherMood/components/Mood/MoodRecommend', () => ({
  __esModule: true,
  default: () => <div>MoodRecommend Component</div>,
}));

describe('WeatherMood', () => {
  it('기본 탭은 weather이며 WeatherRecommend가 렌더링된다', () => {
    render(<WeatherMood />);

    // 탭 버튼 존재
    expect(screen.getByRole('tab', { name: '날씨에 따른' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '기분에 따른' })).toBeInTheDocument();

    // 기본 활성 탭
    expect(screen.getByRole('tab', { name: '날씨에 따른' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // 기본 컨텐츠
    expect(screen.getByText('WeatherRecommend Component')).toBeInTheDocument();
  });

  it('기분 탭 클릭 시 MoodRecommend로 전환된다', () => {
    render(<WeatherMood />);

    fireEvent.click(screen.getByRole('tab', { name: '기분에 따른' }));

    const panels = screen.getAllByRole('tabpanel');
    const visiblePanel = panels.find(p => !p.hasAttribute('hidden')) ?? panels[0];

    expect(visiblePanel).toHaveTextContent('MoodRecommend Component');
    expect(visiblePanel).not.toHaveTextContent('WeatherRecommend Component');
  });

  it('tablist, tabpanel 접근성 역할이 올바르게 설정되어 있다', () => {
    render(<WeatherMood />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });
});
