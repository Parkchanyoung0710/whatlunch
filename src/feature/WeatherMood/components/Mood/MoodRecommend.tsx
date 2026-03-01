'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  getMoodBaseMenus,
  moodOptions,
  type MoodId,
} from '@/feature/WeatherMood/components/Mood/utils/moodRecommend';
import { generateRecommendations } from '@/feature/WeatherMood/components/Mood/utils/recommendEngine';
import { getCategoryByMenu } from '@/feature/WeatherMood/utils/getCategoryByMenu';
import MenuModal from '@/feature/WeatherMood/components/MenuModal/MenuModal';

import styles from './MoodRecommend.module.scss';

const DEFAULT_MOOD: MoodId = 'happy';

export default function MoodRecommend() {
  const [selectedMood, setSelectedMood] = useState<MoodId>(DEFAULT_MOOD);
  const [recommendedMenus, setRecommendedMenus] = useState<string[]>([]);

  // 기분 선택 시 상태 변경
  const handleMoodChange = useCallback((moodId: MoodId) => {
    setSelectedMood(moodId);
  }, []);

  useEffect(() => {
    const baseMenus = getMoodBaseMenus(selectedMood);
    const result = generateRecommendations(baseMenus);

    setRecommendedMenus(result);
  }, [selectedMood]);

  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  return (
    <div className={styles['mood-recommend']}>
      <div className={styles['mood-recommend__list']}>
        {moodOptions.map(option => {
          const isActive = option.id === selectedMood;

          return (
            <button
              key={option.id}
              className={`
                ${styles['mood-recommend__button']}
                ${isActive ? styles['mood-recommend__button--active'] : ''}
              `}
              onClick={() => handleMoodChange(option.id)}
            >
              <span className={styles['mood-recommend__icon']}>{option.icon}</span>
              <span className={styles['mood-recommend__label']}>{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles['mood-recommend__recommend']}>
        <h4>지금 당신에게 맞는 맛</h4>

        <div className={styles['mood-recommend__cards']}>
          {recommendedMenus.map(menu => (
            <button
              key={menu}
              className={styles['mood-recommend__card']}
              onClick={() => setSelectedMenu(menu)}
              type="button"
            >
              {menu}
            </button>
          ))}
        </div>
      </div>

      {selectedMenu && (
        <MenuModal
          menu={selectedMenu}
          category={getCategoryByMenu(selectedMenu)}
          onClose={() => setSelectedMenu(null)}
        />
      )}
    </div>
  );
}
