import { useCallback, useEffect, useRef, useState } from 'react';

import type { NormalizedAirPollutionData } from '@/types/api/airPollution';
import type { WeatherData } from '@/types/api/weather';

// API 응답 타입(날씨 + 대기)
interface WeatherApiResponse {
  weather: WeatherData;
  air: NormalizedAirPollutionData;
}

// useWeather 훅이 외부로 반환하는 상태 타입
interface WeatherState {
  weather: WeatherData | null;
  air: NormalizedAirPollutionData | null;
  error: string | null;
  loading: boolean;
  usedUserLocation: boolean; // true면 내 위치, false면 서울 기준
}

// 위치 권한 팝업 최대 대기 시간
const GEOLOCATION_TIMEOUT_MS = 2500;

function requestUserGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GEO_NOT_SUPPORTED'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false, // 속도 우선
      maximumAge: 60_000, // 1분 내 캐시 위치 허용
    });
  });
}
// 위치 팝업 대기 방지를 위한 타임아웃
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutErrorCode: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(timeoutErrorCode)), timeoutMs);

    promise
      .then(value => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

// UI 표시용 에러 메시지 정규화
function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '알 수 없는 오류가 발생했습니다.';
}
// 좌표를 소수점 2자리로 정규화 (약 1km 단위)
function normalizeCoordinate(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

// 문자열 결합 대신 URLSearchParams로 쿼리 스트링 생성
function buildWeatherApiUrl(params?: { lat: number; lon: number }): string {
  const searchParams = new URLSearchParams();

  if (params) {
    searchParams.set('useUserLocation', 'true');
    searchParams.set('lat', String(params.lat));
    searchParams.set('lon', String(params.lon));
  }

  const queryString = searchParams.toString();
  return queryString ? `/api/weather?${queryString}` : '/api/weather';
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    weather: null,
    air: null,
    error: null,
    loading: true,
    usedUserLocation: false,
  });

  // 최신 요청만 반영
  const requestSequenceRef = useRef(0);

  const fetchWeatherData = useCallback(async (params?: { lat: number; lon: number }) => {
    const url = buildWeatherApiUrl(params);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API_ERROR_${response.status}`);
    }

    const data: WeatherApiResponse = await response.json();
    if (!data.weather || !data.air) {
      throw new Error('INVALID_WEATHER_DATA');
    }

    return data;
  }, []);

  useEffect(() => {
    requestSequenceRef.current += 1;
    const currentRequestId = requestSequenceRef.current;

    // 이전 요청 결과 무시용 가드
    const isStaleRequest = () => requestSequenceRef.current !== currentRequestId;

    const applySuccessState = (data: WeatherApiResponse, usedUserLocation: boolean) => {
      setState({
        weather: data.weather,
        air: data.air,
        error: null,
        loading: false,
        usedUserLocation,
      });
    };

    const applyErrorState = (error: unknown) => {
      setState({
        weather: null,
        air: null,
        error: normalizeErrorMessage(error),
        loading: false,
        usedUserLocation: false,
      });
    };

    async function loadWeather() {
      // 초기 로딩 상태
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 추가: 서울 요청을 먼저 시작하고, 사용자 위치 성공 시 덮어쓰기 위해 promise를 저장
      const seoulWeatherRequest = fetchWeatherData();

      // 서울 데이터가 먼저 오면 바로 화면에 표시
      seoulWeatherRequest
        .then(data => {
          if (!isStaleRequest()) {
            applySuccessState(data, false);
          }
        })
        .catch(() => {
          // 서울 요청 실패는 여기서 에러 처리하지 않음
        });

      // 사용자 위치 시도 (병렬)
      try {
        const position = await withTimeout(
          requestUserGeolocation(),
          GEOLOCATION_TIMEOUT_MS,
          'GEOLOCATION_TIMEOUT'
        );

        if (isStaleRequest()) return;

        const lat = normalizeCoordinate(position.coords.latitude);
        const lon = normalizeCoordinate(position.coords.longitude);

        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          const userLocationData = await fetchWeatherData({ lat, lon });
          if (isStaleRequest()) return;

          // 사용자 위치 성공시 서울 데이터 덮어쓰기
          applySuccessState(userLocationData, true);
          return;
        }
      } catch {
        // 위치 실패 시 아무 처리 없이 서울 fallback으로 진행
      }

      // 위치 실패시 서울로 요청
      try {
        const seoulData = await seoulWeatherRequest;
        if (isStaleRequest()) return;

        applySuccessState(seoulData, false);
      } catch (error) {
        if (isStaleRequest()) return;
        applyErrorState(error);
      }
    }

    loadWeather();
  }, [fetchWeatherData]);

  return state;
}
