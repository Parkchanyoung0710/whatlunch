'use client';

import { useState } from 'react';

import { useKakaoShare } from '@/shared/hooks/useKakaoShare';

import Modal from '@/shared/components/Modal';
import Button from '@/shared/components/Button';

import { RouletteModalProps } from './types';
import { DEFAULT_IMAGE } from '../../constants';
import { getFoodImageByMenu } from '@/shared/utils/getFoodImageByMenu';
import { Category } from '@/types/enum';

import styles from './RouletteModal.module.scss';

function isValidFoodCategory(
  category: Category
): category is Exclude<Category, Category.ALL | Category.BEST> {
  return category !== Category.ALL && category !== Category.BEST;
}

export default function RouletteModal({ menu, onClose, roomCode }: RouletteModalProps) {
  const [isImageError, setIsImageError] = useState(false);
  const { shareToKakao } = useKakaoShare();

  const isSoloMode = !roomCode || roomCode === 'solo';

  // 카카오톡 공유 클릭 처리
  const handleShareClick = () => {
    if (!menu) return;

    // 카카오 공유용 이미지 URL
    const productionUrl = 'https://whatlunch.vercel.app';
    const shareImageUrl = isValidFoodCategory(menu.category)
      ? `${productionUrl}${getFoodImageByMenu(menu.name, menu.category)}`
      : `${productionUrl}${DEFAULT_IMAGE}`;

    let success = false;

    // 같이 정하기 모드일 때 방 코드 포함
    if (!isSoloMode && roomCode) {
      success = shareToKakao({
        title: '같이 점심 메뉴 정해요! 🍽️',
        description: `오늘의 메뉴: ${menu.name}\n\n🔑 방 코드: ${roomCode}\n 참여하려면 로그인이 필요해요!`,
        buttonTitle: '방 참여하기',
        roomCode,
        imageUrl: shareImageUrl,
      });
    } else {
      success = shareToKakao({
        title: '오늘의 메뉴 추천 🍽️',
        description: `오늘은 ${menu.name} 어때요?`,
        buttonTitle: '나도 돌려보기',
        roomCode: 'solo',
        imageUrl: shareImageUrl,
      });
    }

    if (!success) {
      alert('카카오톡 공유에 실패했습니다.');
    }
  };
  const imageSrc =
    !menu || isImageError || !isValidFoodCategory(menu.category)
      ? DEFAULT_IMAGE
      : getFoodImageByMenu(menu.name, menu.category);

  return (
    <Modal isOpen={true} onClose={onClose} description="오늘은 이 메뉴로 가볼까요?">
      <div className={styles['modal__content']}>
        <img
          src={imageSrc}
          alt={menu ? `${menu.name} 음식 이미지` : '선택된 메뉴 이미지'}
          loading="eager"
          className={styles['modal__image']}
          onError={() => setIsImageError(true)}
        />
        <p className={styles['modal__name']}>{menu?.name}</p>
        <div className={styles['modal__buttons']}>
          <Button variant="orange" onClick={handleShareClick} disabled={!menu}>
            카카오톡 공유
          </Button>

          <Button
            variant="blue"
            disabled={!menu}
            onClick={() =>
              window.open(
                `https://map.kakao.com/?q=${encodeURIComponent(menu?.name ?? '')}`,
                '_blank'
              )
            }
          >
            지도 보기
          </Button>

          <Button variant="primary" mode="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
