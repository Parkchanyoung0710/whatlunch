'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

import { getFoodImageByMenu } from '@/shared/utils/getFoodImageByMenu';
import { MENU_DESCRIPTION_MAP } from './menuDescriptionMap';
import { MenuModalProps } from './types';

import styles from './MenuModal.module.scss';

export default function MenuModal({ menu, category, onClose }: MenuModalProps) {
  const imageSrc = getFoodImageByMenu(menu, category);
  const description = MENU_DESCRIPTION_MAP[menu] ?? '오늘 컨디션에 잘 어울리는 메뉴예요';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={styles['menu-modal']}>
      <button
        type="button"
        className={styles['menu-modal__overlay']}
        onClick={onClose}
        aria-label="메뉴 모달 닫기"
      />

      <div
        className={styles['menu-modal__container']}
        role="dialog"
        aria-modal="true"
        aria-label={`${menu} 상세 정보`}
      >
        <button
          type="button"
          className={styles['menu-modal__close']}
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        <div className={styles['menu-modal__image-wrap']}>
          <img src={imageSrc} alt={menu} loading="eager" className={styles['menu-modal__image']} />

          <div className={styles['menu-modal__image-title']}>{menu}</div>
        </div>

        <p className={styles['menu-modal__description']}>{description}</p>
      </div>
    </div>
  );
}
