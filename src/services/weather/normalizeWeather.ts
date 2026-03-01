import type { WeatherData } from '@/types/api/weather';
import type { AirPollutionData, NormalizedAirPollutionData } from '@/types/api/airPollution';

// 날씨 데이터 정규화
export function normalizeWeather(data: WeatherData): WeatherData {
  return {
    ...data,
    weather:
      data.weather && data.weather.length > 0
        ? data.weather
        : [{ main: 'Clear', description: 'Unknown', icon: '01d' }],
    clouds: { all: data.clouds?.all ?? 0 },
  };
}

// 대기오염 데이터 정규화
export function normalizeAir(data?: AirPollutionData): NormalizedAirPollutionData {
  if (!data?.list?.length) {
    return createFallbackAir();
  }

  const first = data.list[0];
  const comp = first?.components ?? ({} as Partial<AirPollutionData['list'][number]['components']>);

  return {
    list: [
      {
        main: { aqi: first?.main?.aqi ?? 1 },
        components: {
          pm2_5: comp.pm2_5 ?? null,
          pm10: comp.pm10 ?? null,
          o3: comp.o3 ?? null,
          no2: comp.no2 ?? null,
          so2: comp.so2 ?? null,
          co: comp.co ?? null,
        },
      },
    ],
  };
}

// 대기오염 데이터 fallback
function createFallbackAir(): NormalizedAirPollutionData {
  return {
    list: [
      {
        main: { aqi: 1 },
        components: {
          pm2_5: null,
          pm10: null,
          o3: null,
          no2: null,
          so2: null,
          co: null,
        },
      },
    ],
  };
}
