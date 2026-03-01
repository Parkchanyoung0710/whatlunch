'use client';

import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Pencil, Star, Timer, Users, Utensils, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

import { useAuthStore } from '@/feature/Auth/store/auth.store';
import { useProfileImageUpload } from '@/feature/Auth/hooks/useProfileImageUpload';
import { authServiceClient } from '@/services/backend/auth.api';
import { useEscClose } from '@/shared/hooks/useEscClose';
import { getMyFoodDots } from '@/services/backend/users.api';

import { ProfileImage } from '@/shared/components/ProfileImage';
import Badge, { BadgeProps } from '@/shared/components/Badge';
import { FOOD_DOTS } from '@/feature/Mypage/constants/foodDots';

import styles from './MyPageHeader.module.scss';

const DEFAULT_USER_FALLBACK = {
  id: 'temp-user',
  nickname: '게스트',
  profileImage: '/icons/default_profile.png',
};

const DEFAULT_PROFILE_IMAGE_PATH = '/icons/default_profile.png';

const BADGES: readonly BadgeProps[] = [
  { id: 'decisions', variant: 'blue', Icon: Utensils, text: '결정 12회' },
  { id: 'top-menu', variant: 'green', Icon: Star, text: '가장 많이 나온 메뉴: 치킨' },
  { id: 'rooms', variant: 'purple', Icon: Users, text: '참여한 방 5개' },
  { id: 'avg-time', variant: 'orange', Icon: Timer, text: '평균 결정 시간 6초' },
] as const;

const MyPageHeader = () => {
  const { uploadProfileImage, removeProfileImage, isUploading } = useProfileImageUpload();
  const queryClient = useQueryClient();

  const updateProfileImage = useAuthStore(state => state.updateProfileImage);

  const { data: selectedDotIds = [] } = useQuery({
    queryKey: ['foodDots'],
    queryFn: () => getMyFoodDots(),
  });

  const selectedDots = selectedDotIds
    .map(id => FOOD_DOTS.find(dot => dot.id === id))
    .filter((dot): dot is (typeof FOOD_DOTS)[number] => dot !== undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: authServiceClient.getMe,
  });

  const displayUser = user || DEFAULT_USER_FALLBACK;
  const isDefaultImage =
    !displayUser.profileImage || displayUser.profileImage === DEFAULT_PROFILE_IMAGE_PATH;

  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  useEscClose(isMenuOpen ? () => setIsMenuOpen(false) : undefined);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      firstMenuItemRef.current?.focus();
    }
  }, [isMenuOpen]);

  const openFilePicker = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const handleResetImage = async () => {
    if (isUploading) return;
    try {
      await removeProfileImage();
      toast.success('기본 이미지로 변경되었습니다.');
      updateProfileImage(null);
      // 서버 데이터 갱신 요청
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    } catch {
      toast.error('이미지 변경에 실패했습니다.');
    } finally {
      setIsMenuOpen(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      // 이전 미리보기 URL 정리
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      // 낙관적 업데이트
      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setDisplayImage(previewUrl);
      updateProfileImage(previewUrl);

      // 서버 업로드 → 실제 URL 수신
      const uploadedUrl = await uploadProfileImage(file);
      if (!uploadedUrl) {
        throw new Error('업로드 결과 URL 없음');
      }

      // 실제 URL로 교체
      setDisplayImage(uploadedUrl);
      updateProfileImage(uploadedUrl);

      // blob URL 정리
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      toast.success('프로필 이미지가 변경되었습니다.');

      // 서버 데이터 갱신 요청
      await queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    } catch {
      toast.error('이미지 변경 실패. 잠시 후 다시 시도해주세요.');

      // 실패 시 blob URL 정리
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      // 원래 이미지로 복구
      setDisplayImage(displayUser.profileImage);
      updateProfileImage(displayUser.profileImage || null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [displayNickname, setDisplayNickname] = useState(displayUser.nickname);
  const [displayImage, setDisplayImage] = useState(displayUser.profileImage);

  // preview URL 관리 (메모리 누수 방지)
  const previewUrlRef = useRef<string | null>(null);

  // user가 바뀌면 동기화 (닉네임 & 이미지)
  useEffect(() => {
    setDisplayNickname(displayUser.nickname);
    setDisplayImage(displayUser.profileImage);
  }, [displayUser.nickname, displayUser.profileImage]);

  // 실시간 업데이트 이벤트 리스너
  useEffect(() => {
    const nicknameHandler = (e: Event) => {
      const customEvent = e as CustomEvent<{ nickname: string }>;
      if (customEvent.detail?.nickname) setDisplayNickname(customEvent.detail.nickname);
    };
    const imageHandler = (e: Event) => {
      const customEvent = e as CustomEvent<{ profileImage: string | null }>;
      if (
        customEvent.detail &&
        Object.prototype.hasOwnProperty.call(customEvent.detail, 'profileImage')
      ) {
        setDisplayImage(customEvent.detail.profileImage);
      }
    };
    window.addEventListener('profile:nicknameUpdated', nicknameHandler as EventListener);
    window.addEventListener('profile:imageUpdated', imageHandler as EventListener);
    return () => {
      window.removeEventListener('profile:nicknameUpdated', nicknameHandler as EventListener);
      window.removeEventListener('profile:imageUpdated', imageHandler as EventListener);
      // 컴포넌트 언마운트 시 preview URL 정리
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  if (!user) return null;

  return (
    <section className={styles['profile-header']} aria-labelledby="profile-header-title">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        hidden
      />

      <div className={styles['profile-header__avatar']} ref={avatarRef}>
        <ProfileImage src={displayImage} variant="editable" priority />

        <button
          type="button"
          className={styles['profile-header__avatar-edit-button']}
          aria-label="프로필 이미지 편집"
          disabled={isUploading}
          onClick={e => {
            e.stopPropagation();
            setIsMenuOpen(prev => !prev);
          }}
        >
          <Pencil size={14} />
        </button>

        {isMenuOpen && !isUploading && (
          <div className={styles['profile-header__avatar-menu']} role="menu">
            <button ref={firstMenuItemRef} type="button" role="menuitem" onClick={openFilePicker}>
              <ImageIcon size={14} />
              이미지 변경
            </button>

            {!isDefaultImage && (
              <button
                type="button"
                role="menuitem"
                className={styles['profile-header__avatar-menu--danger']}
                onClick={handleResetImage}
              >
                <RotateCcw size={14} />
                기본 이미지로 변경
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles['profile-header__body']}>
        <h1 className={styles['profile-header__title']} id="profile-header-title">
          {displayNickname}님의 마이페이지
        </h1>
        <p className={styles['profile-header__subtitle']}>오늘 기록이 여기에 정리돼요</p>

        <div className={styles['profile-header__stats']}>
          {BADGES.map(({ id, variant, Icon, text }) => (
            <Badge key={id} id={id} variant={variant} Icon={Icon} text={text} />
          ))}
        </div>
        {selectedDots.length > 0 && (
          <div className={styles['profile-header__food-dots']}>
            {selectedDots.map(dot => (
              <div key={dot.id} className={styles['profile-header__food-dot']}>
                <Image src={dot.src} alt={dot.label} width={28} height={28} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyPageHeader;
