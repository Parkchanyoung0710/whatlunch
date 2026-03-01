'use client';

import { useState } from 'react';
import { Check, Utensils } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { toast } from 'react-toastify';

import Modal from '@/shared/components/Modal';

import { addFoodDot, getMyFoodDots, removeFoodDot } from '@/services/backend/users.api';

import { FOOD_DOTS } from '@/domain/Mypage/constants/foodDots';

import styles from './FoodDotSelectionCard.module.scss';

export default function FoodDotSelectionCard() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: foodDotIds = [] } = useQuery({
    queryKey: ['foodDots'],
    queryFn: () => getMyFoodDots(),
  });

  const toggleMutation = useMutation({
    mutationFn: async (dotId: string) => {
      const isSelected = foodDotIds.includes(dotId);
      return isSelected ? removeFoodDot(dotId) : addFoodDot(dotId);
    },
    onSuccess: nextDotIds => {
      queryClient.setQueryData(['foodDots'], nextDotIds);
    },
    onError: () => {
      toast.error('선택 저장에 실패했어요');
    },
  });

  const selectedDots = foodDotIds
    .map(id => FOOD_DOTS.find(dot => dot.id === id))
    .filter((dot): dot is (typeof FOOD_DOTS)[number] => Boolean(dot));

  const handleToggleDot = (dotId: string) => {
    if (foodDotIds.length >= 9 && !foodDotIds.includes(dotId)) {
      toast.info('음식 뱃지는 최대 9개까지 선택할 수 있어요');
      return;
    }
    toggleMutation.mutate(dotId);
  };
  return (
    <>
      <section className={styles['food-dot-card']} aria-label="음식 뱃지 선택">
        <header className={styles['food-dot-card__header']}>
          <h2 className={styles['food-dot-card__title']}>음식 뱃지 선택</h2>
          <p className={styles['food-dot-card__desc']}>
            최대 9개까지 선택할 수 있어요 ({foodDotIds.length}/9)
          </p>
        </header>

        {foodDotIds.length > 0 ? (
          <ul className={styles['food-dot-card__list']}>
            {selectedDots.map(dot => (
              <li key={dot.id} className={styles['food-dot-card__item']}>
                <div className={styles['food-dot-card__selected']}>
                  <Image
                    src={dot.src}
                    alt={dot.label}
                    width={40}
                    height={40}
                    className={styles['food-dot-card__selected-img']}
                  />
                  <span className={styles['food-dot-card__label']}>{dot.label}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles['food-dot-card__empty']}>
            <Utensils size={32} strokeWidth={1.5} aria-hidden />
            <p>아직 선택한 뱃지가 없어요</p>
          </div>
        )}

        <div className={styles['food-dot-card__footer']}>
          <button
            type="button"
            className={styles['food-dot-card__view-all']}
            onClick={() => setIsModalOpen(true)}
          >
            {foodDotIds.length > 0 ? '편집하기' : '뱃지 고르기'}
          </button>
        </div>
      </section>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`음식 뱃지 전체 보기 (${foodDotIds.length}/9) 🥐`}
          description="좋아하는 음식 뱃지를 클릭해보세요!"
          innerClassName={styles['food-dot-modal']}
        >
          <ul className={styles['food-dot-modal__list']}>
            {FOOD_DOTS.map(dot => (
              <li key={dot.id} className={styles['food-dot-modal__item']}>
                <button
                  type="button"
                  className={styles['food-dot-modal__button']}
                  onClick={() => handleToggleDot(dot.id)}
                  aria-pressed={foodDotIds.includes(dot.id)}
                >
                  <Image src={dot.src} alt={dot.label} width={56} height={56} />
                  {foodDotIds.includes(dot.id) && (
                    <span className={styles['food-dot-modal__check']}>
                      <Check size={18} />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
}
