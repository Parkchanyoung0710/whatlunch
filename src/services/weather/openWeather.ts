import type { AirPollutionData } from '@/types/api/airPollution';
import type { WeatherData } from '@/types/api/weather';

import { getWeatherApiKey } from './config';
import { toLocKeyParts } from './timeSlotCache';

const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 현재 날씨 정보 조회 - 좌표를 toFixed 캐시 키로 통일
export async function fetchWeather(
  lat: number,
  lon: number,
  revalidateSeconds: number
): Promise<WeatherData> {
  const apiKey = getWeatherApiKey();
  const { fixedLat, fixedLon } = toLocKeyParts(lat, lon);

  const url =
    `${WEATHER_BASE_URL}/weather` +
    `?lat=${fixedLat}` +
    `&lon=${fixedLon}` +
    `&appid=${apiKey}` +
    `&units=metric` +
    `&lang=kr`;

  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.status}`);
  }

  return res.json();
}

// 대기 오염 정보 조회 - 날씨와 동일한 좌표 캐시 정책 사용
export async function fetchAirPollution(
  lat: number,
  lon: number,
  revalidateSeconds: number
): Promise<AirPollutionData> {
  const apiKey = getWeatherApiKey();
  const { fixedLat, fixedLon } = toLocKeyParts(lat, lon);

  const url =
    `${WEATHER_BASE_URL}/air_pollution` +
    `?lat=${fixedLat}` +
    `&lon=${fixedLon}` +
    `&appid=${apiKey}`;

  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`Air pollution fetch failed: ${res.status}`);
  }

  return res.json();
}
