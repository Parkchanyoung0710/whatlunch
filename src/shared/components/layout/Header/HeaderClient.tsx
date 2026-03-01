'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';

import Button from '@/shared/components/Button';
import LoginModal from '@/domain/Auth/LoginModal';
import SignupModal from '@/domain/Auth/SignupModal';
import { ProfileImage } from '@/shared/components/ProfileImage';

import { authServiceClient } from '@/services/backend/auth.api';
import { useAuthStore } from '@/domain/Auth/store/auth.store';
import { disconnectSocket } from '@/lib/socket';

import WhatLunchLogo from '../../../../../public/icons/what-lunch-logo.svg';
import styles from './Header.module.scss';

export default function HeaderClient({ user: initialUser }: { user: Auth.MeRes | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const storeUser = useAuthStore(state => state.user);
  const clearUser = useAuthStore(state => state.clearUser);

  useEffect(() => {
    if (initialUser) {
      useAuthStore.setState(state => ({
        ...state,
        user: initialUser,
      }));
    } else {
      clearUser();
    }
  }, [initialUser, clearUser]);

  const displayUser = storeUser ?? initialUser;

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await authServiceClient.postLogout();
      disconnectSocket();
      queryClient.clear();
      clearUser();

      toast.success('로그아웃 되었습니다.');

      router.refresh();
    } catch (error) {
      console.error('[Header] 로그아웃 실패:', error);
      toast.error('로그아웃에 실패했습니다.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [router, queryClient, clearUser, isLoggingOut]);

  return (
    <header className={styles['header']}>
      <div className={styles['header__menu']}>
        <Link href="/">
          <span>홈</span>
        </Link>

        {displayUser && (
          <Link href="/mypage">
            <span>마이페이지</span>
          </Link>
        )}
      </div>

      <Link href="/" className={styles['header__logo']}>
        <Image src={WhatLunchLogo} alt="What Lunch Logo" width={60} height={60} priority />
        <span>What Lunch</span>
      </Link>

      <div className={styles['header__auth']}>
        <div style={{ width: '80px', height: '40px' }} />
        {displayUser ? (
          <>
            <div className={styles['header__user']}>
              <div className={styles['header__user-avatar']}>
                <ProfileImage
                  src={displayUser.profileImage ?? '/icons/default_profile.png'}
                  priority
                />
              </div>
              <span className={styles['header__user-nickname']}>
                {displayUser.nickname || '사용자'}님
              </span>
            </div>
            <Button variant="primary" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={() => setModalType('login')}>
              로그인
            </Button>
            <Button variant="primary" onClick={() => setModalType('signup')}>
              회원가입
            </Button>
          </>
        )}
      </div>

      {!isMobileMenuOpen && (
        <button
          type="button"
          className={styles['header__hamburger']}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="메뉴 열기"
        >
          <Menu size={26} />
        </button>
      )}

      {isMobileMenuOpen && (
        <>
          <div
            className={styles['header__mobile-overlay']}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={styles['header__mobile-menu']}>
            <div className={styles['header__mobile-menu-header']}>
              <span className={styles['header__mobile-menu-title']}>메뉴</span>
              <button
                type="button"
                className={styles['header__mobile-menu-close']}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="메뉴 닫기"
              >
                <X size={28} />
              </button>
            </div>

            <ul className={styles['header__mobile-menu-list']}>
              <li>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  홈
                </Link>
              </li>

              {displayUser && (
                <li>
                  <Link href="/mypage" onClick={() => setIsMobileMenuOpen(false)}>
                    마이페이지
                  </Link>
                </li>
              )}

              {displayUser ? (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType('login');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      로그인
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType('signup');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      회원가입
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </>
      )}

      {modalType === 'login' && (
        <LoginModal
          onClose={() => setModalType(null)}
          onSignupOpen={() => setModalType('signup')}
        />
      )}
      {modalType === 'signup' && (
        <SignupModal onClose={() => setModalType(null)} onLoginOpen={() => setModalType('login')} />
      )}
    </header>
  );
}
