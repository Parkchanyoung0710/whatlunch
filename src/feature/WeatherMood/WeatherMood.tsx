'use client';

import { useState } from 'react';
import { CloudSun, Smile } from 'lucide-react';

import TopTabs from '@/shared/components/TopTabs';

import MoodRecommend from './components/Mood/MoodRecommend';
import WeatherRecommend from './components/Weather/WeatherRecommend';

import type { TopTabItem } from '@/shared/components/TopTabs';

const TAB_LIST = [
  { value: 'weather', label: '날씨에 따른', icon: <CloudSun size={18} /> },
  { value: 'mood', label: '기분에 따른', icon: <Smile size={18} /> },
] as const satisfies readonly TopTabItem[];

type TabValue = (typeof TAB_LIST)[number]['value']; // 'weather' | 'mood'
const DEFAULT_TAB: TabValue = TAB_LIST[0].value;

const isTabValue = (value: string): value is TabValue =>
  TAB_LIST.some(item => item.value === value);

export default function WeatherMood() {
  const [activeTab, setActiveTab] = useState<TabValue>(DEFAULT_TAB);

  return (
    <TopTabs
      items={TAB_LIST}
      value={activeTab}
      onChange={next => {
        if (isTabValue(next)) setActiveTab(next);
      }}
      renderPanel={active => {
        if (active === 'weather') return <WeatherRecommend />;
        return <MoodRecommend />;
      }}
    />
  );
}
