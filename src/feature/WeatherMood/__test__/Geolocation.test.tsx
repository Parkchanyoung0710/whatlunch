import { renderHook, waitFor } from '@testing-library/react';
import { useWeather } from '@/feature/WeatherMood/hooks/useWeather';

const mockGeolocation: {
  getCurrentPosition: jest.Mock;
} = {
  getCurrentPosition: jest.fn(),
};

beforeAll(() => {
  // @ts-expect-error: 테스트 환경에서 geolocation mock
  global.navigator.geolocation = mockGeolocation;

  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWeather - 위치 권한', () => {
  it('위치 승인 시 에러 없이 로딩이 종료된다', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.5,
          longitude: 127.0,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        weather: {
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
          main: {
            temp: 20,
            feels_like: 19,
            humidity: 50,
          },
          name: '서울',
        },
        air: {
          list: [{ main: { aqi: 2 } }],
        },
      }),
    });

    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('위치 거부 시 에러 상태를 설정한다', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({
          code: 1,
          message: 'Permission denied',
        } as GeolocationPositionError);
      }
    );

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
