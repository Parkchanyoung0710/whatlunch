import type { WeatherMain } from '@/types/api/weather';

// 날씨 설명 문자열을 짧은 한글 표현으로 매핑하기 위한 규칙
interface WeatherPattern {
  keyword: string; // 설명에 포함되면 매칭할 키워드
  label: string; // 화면에 표시할 짧은 문구
}

// WeatherMain 값을 UI용 한글 텍스트로 변환
export const shortWeatherByMain: Partial<Record<WeatherMain, string>> = {
  Clear: '맑음',
  Clouds: '흐림',
  Rain: '비',
  Drizzle: '비',
  Thunderstorm: '천둥번개',
  Snow: '눈',
  Mist: '안개',
  Haze: '안개',
  Fog: '안개',
  Smoke: '연기',
  Dust: '먼지',
  Sand: '모래',
  Ash: '재',
  Squall: '돌풍',
};

// 날씨 설명 문구에 포함된 키워드를 기준으로 치환 규칙 정의
export const WEATHER_DESCRIPTION_PATTERNS: WeatherPattern[] = [
  // 구름
  { keyword: '튼구름', label: '구름 많음' },
  { keyword: '튼 구름', label: '구름 많음' },
  { keyword: '약간의 구름', label: '구름 조금' },
  { keyword: '구름', label: '구름' },

  // 비
  { keyword: '약한 비', label: '약한 비' },
  { keyword: '가랑비', label: '약한 비' },
  { keyword: '강한 비', label: '폭우' },
  { keyword: '비', label: '비' },

  // 눈
  { keyword: '약한 눈', label: '약한 눈' },
  { keyword: '강한 눈', label: '강한 눈' },
  { keyword: '눈', label: '눈' },

  // 대기 상태
  { keyword: '안개', label: '안개' },
  { keyword: '박무', label: '안개' },
  { keyword: '연기', label: '연기' },
  { keyword: '연무', label: '연무' },
];

// 날씨 설명 문장을 UI에 표시할 짧은 문구로 변환
export function getShortDescription(desc: string): string {
  const clean = desc.trim();
  // 비정상/미확인 값 처리
  if (!clean || clean === 'Unknown') {
    return '알 수 없음';
  }

  for (const pattern of WEATHER_DESCRIPTION_PATTERNS) {
    if (clean.includes(pattern.keyword)) {
      return pattern.label;
    }
  }

  return clean; // 매칭 규칙이 없으면 원문 사용
}
