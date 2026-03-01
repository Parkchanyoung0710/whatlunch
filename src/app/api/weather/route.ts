import { NextResponse } from 'next/server';

import { fetchAirPollution, fetchWeather } from '@/services/weather/openWeather';
import { normalizeAir, normalizeWeather } from '@/services/weather/normalizeWeather';
import { secondsUntilNextKstBoundary } from '@/services/weather/timeSlotCache';

// 서울 기본 좌표 (위치 미사용 시 fallback)
const SEOUL_LAT = 37.5665;
const SEOUL_LON = 126.978;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 사용자 위치 사용 여부
    const useUserLocation = searchParams.get('useUserLocation') === 'true';

    // 사용자 전달 좌표
    const rawLat = Number(searchParams.get('lat'));
    const rawLon = Number(searchParams.get('lon'));

    // 위치 사용 + 좌표 유효할 때만 사용자 위치 채택
    const userOk = useUserLocation && Number.isFinite(rawLat) && Number.isFinite(rawLon);

    // 최종 좌표 결정 (사용자 위치 or 서울 fallback)
    const lat = userOk ? rawLat : SEOUL_LAT;
    const lon = userOk ? rawLon : SEOUL_LON;

    // KST 기준 다음 06/18시까지 남은 초 (하루 2회 갱신용)
    const revalidateSeconds = secondsUntilNextKstBoundary();

    // 날씨, 대기오염 정보 요청
    const [weatherRaw, airRaw] = await Promise.all([
      fetchWeather(lat, lon, revalidateSeconds),
      fetchAirPollution(lat, lon, revalidateSeconds).catch(() => undefined),
    ]);

    // 응답 데이터 정규화 후 반환
    return NextResponse.json({
      weather: normalizeWeather(weatherRaw),
      air: normalizeAir(airRaw),
    });
  } catch (error) {
    // 예외 발생 시 서버 에러 반환
    return NextResponse.json({ error: 'server error', detail: String(error) }, { status: 500 });
  }
}
