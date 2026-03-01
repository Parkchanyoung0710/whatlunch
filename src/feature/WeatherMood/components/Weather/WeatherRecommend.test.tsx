import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useWeather } from '@/feature/WeatherMood/hooks/useWeather';
import { useWeatherRecommend } from '@/feature/WeatherMood/hooks/useWeatherRecommend';

import WeatherRecommend from './WeatherRecommend';

jest.mock('@/domain/WeatherMood/hooks/useWeather');
jest.mock('@/domain/WeatherMood/hooks/useWeatherRecommend');

const mockUseWeather = useWeather as jest.Mock;
const mockUseWeatherRecommend = useWeatherRecommend as jest.Mock;

describe('WeatherRecommend', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('날씨 로딩 중일 때 로딩 문구를 보여준다', () => {
    mockUseWeather.mockReturnValue({
      weather: null,
      air: null,
      loading: true,
      error: null,
    });

    mockUseWeatherRecommend.mockReturnValue({
      menus: null,
      loading: false,
    });

    render(<WeatherRecommend />);

    expect(screen.getByText('날씨 불러오는 중...')).toBeInTheDocument();
  });

  it('에러가 발생하면 에러 메시지를 보여준다', () => {
    mockUseWeather.mockReturnValue({
      weather: null,
      air: null,
      loading: false,
      error: '날씨 정보를 불러오지 못했습니다',
    });

    mockUseWeatherRecommend.mockReturnValue({
      menus: null,
      loading: false,
    });

    render(<WeatherRecommend />);

    expect(screen.getByText('날씨 정보를 불러오지 못했습니다')).toBeInTheDocument();
  });

  it('날씨 정보, 공기질, 추천 메뉴를 정상적으로 렌더링한다', () => {
    mockUseWeather.mockReturnValue({
      loading: false,
      error: null,
      weather: {
        name: '서울',
        main: {
          temp: 22.3,
          feels_like: 21.7,
          humidity: 55,
        },
        weather: [
          {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
      },
      air: {
        list: [
          {
            main: { aqi: 2 },
          },
        ],
      },
    });

    mockUseWeatherRecommend.mockReturnValue({
      loading: false,
      menus: ['비빔밥', '국밥'],
    });

    render(<WeatherRecommend />);

    // 위치 + 날씨 요약
    expect(screen.getByText(/서울/)).toBeInTheDocument();
    expect(screen.getByText(/clear/i)).toBeInTheDocument();

    // 온도 / 체감온도 / 습도
    expect(screen.getByText('22°')).toBeInTheDocument();
    expect(screen.getByText(/체감온도 22°/)).toBeInTheDocument();
    expect(screen.getByText(/습도 55%/)).toBeInTheDocument();

    // 공기질
    expect(screen.getByText('(공기 상태: 보통)')).toBeInTheDocument();

    // 추천 메뉴
    expect(screen.getByText('비빔밥')).toBeInTheDocument();
    expect(screen.getByText('국밥')).toBeInTheDocument();
  });
});
