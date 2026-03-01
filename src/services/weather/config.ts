export function getWeatherApiKey() {
  const key = process.env.WEATHER_API_KEY;
  if (!key) throw new Error('WEATHER_API_KEY is missing');
  return key;
}
