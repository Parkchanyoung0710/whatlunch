'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserIcon,
  MailIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
  MessageCircleIcon,
} from 'lucide-react';

import EditProfileModal from './EditProfile';
import LogoutModal from './LogoutModal';
import FaqModal from './FaqModal';

import styles from './AccountSetting.module.scss';
import Button from '@/shared/components/Button/Button';
import { authServiceClient } from '@/services/backend/auth.api';

// 활성화된 모달 타입
type AccountSettingActiveModal = 'edit-profile' | 'logout' | null;

// 메뉴 아이템 타입
interface AccountSettingMenuItem {
  key: 'email' | 'edit-profile' | 'logout';
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default function AccountSetting() {
  const [activeModal, setActiveModal] = useState<AccountSettingActiveModal>(null);
  const [faqModal, setFaqModal] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => authServiceClient.getMe(),
  });

  const settingMenus: AccountSettingMenuItem[] = [
    {
      key: 'email',
      icon: <MailIcon size={18} />,
      title: '이메일',
      description: user?.email ?? 'example@gmail.com',
      disabled: true,
    },
    {
      key: 'edit-profile',
      icon: <SettingsIcon size={18} />,
      title: '개인 정보 수정',
      description: '프로필 및 개인정보 변경',
      onClick: () => setActiveModal('edit-profile'),
    },
    {
      key: 'logout',
      icon: <LogOutIcon size={18} />,
      title: '로그아웃',
      description: '계정에서 로그아웃하기',
      onClick: () => setActiveModal('logout'),
    },
  ];

  return (
    <>
      <section className={styles['account-setting']}>
        <header className={styles['account-setting__header']}>
          <h2 className={styles['account-setting__header__title']}>계정 설정</h2>
          <UserIcon className={styles['account-setting__header__icon']} />
        </header>

        <div className={styles['account-setting__menu']}>
          {settingMenus.map(menu => {
            const isClickable = Boolean(menu.onClick) && !menu.disabled;

            return (
              <div
                key={menu.key}
                className={[
                  styles['account-setting__menu__section'],
                  menu.key === 'logout' ? styles['account-setting__menu__section--logout'] : '',
                  menu.disabled ? styles['is-disabled'] : isClickable ? styles['is-clickable'] : '',
                ].join(' ')}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : -1}
                aria-disabled={!isClickable}
                onClick={menu.onClick}
                onKeyDown={e => {
                  if (!isClickable) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    menu.onClick?.();
                  }
                }}
              >
                <div className={styles['account-setting__menu__section__info']}>
                  <span className={styles['account-setting__menu__section__info__icon']}>
                    {menu.icon}
                  </span>

                  <div>
                    <div className={styles['account-setting__menu__section__info__title']}>
                      {menu.title}
                    </div>
                    <div className={styles['account-setting__menu__section__info__description']}>
                      {menu.description}
                    </div>
                  </div>
                </div>

                {isClickable && (
                  <ChevronRightIcon className={styles['account-setting__menu__section__chevron']} />
                )}
              </div>
            );
          })}
          <div className={styles['account-setting__menu__help']}>
            <MessageCircleIcon className={styles['account-setting__menu__help__icon']} />
            <div className={styles['account-setting__menu__help__content']}>
              <div className={styles['account-setting__menu__help__content__text']}>
                <div className={styles['account-setting__menu__help__content__text__title']}>
                  도움이 필요하신가요?
                </div>
                <div className={styles['account-setting__menu__help__content__text__description']}>
                  메뉴 선택이나 서비스 이용에 어려움이 있으시면 언제든지 문의해주세요.
                </div>
              </div>
              <Button variant="blue" onClick={() => setFaqModal(true)}>
                지금 문의하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      <EditProfileModal
        isOpen={activeModal === 'edit-profile'}
        onClose={() => setActiveModal(null)}
      />

      <FaqModal isOpen={faqModal} onClose={() => setFaqModal(false)} />
      <LogoutModal isOpen={activeModal === 'logout'} onClose={() => setActiveModal(null)} />
    </>
  );
}
