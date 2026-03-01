'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

import Button from '@/shared/components/Button';
import BaseInput from '@/shared/components/Input/BaseInput';
import PasswordInput from '@/shared/components/Input/PasswordInput';
import Modal from '@/shared/components/Modal';

import { authServiceClient } from '@/services/backend/auth.api';
import { useAuthStore } from '@/domain/Auth/store/auth.store';
import { SignupModalProps } from '../types';

import Google from '../../../../public/icons/google.png';

import styles from '../AuthModal.module.scss';

export default function SignupModal({ onClose, onLoginOpen }: SignupModalProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // 무한 루프 방지를 위해 selector를 분리
  const clearUser = useAuthStore(state => state.clearUser);
  const setUser = useAuthStore(state => state.setUser);

  const signupMutation = useMutation({
    mutationFn: (data: Auth.RegisterReq) => authServiceClient.postSignup(data),
    onSuccess: () => {
      clearUser();
      toast.success('회원가입이 완료되었습니다! 로그인해주세요.');
      onLoginOpen();
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    },
  });

  // 구글 로그인 버튼 ref
  const googleLoginButtonRef = useRef<HTMLDivElement>(null);

  // 구글 회원가입 mutation
  const googleSignupMutation = useMutation({
    mutationFn: (data: { idToken: string }) => authServiceClient.loginWithGoogle(data),
    onSuccess: res => {
      // 성공 시 바로 로그인
      setUser(res.user);

      toast.success('구글 계정으로 회원가입 및 로그인되었습니다!');
      onClose();
      setTimeout(() => {
        router.refresh();
      }, 100);
    },
    onError: () => {
      toast.error('구글 회원가입에 실패했습니다.');
    },
  });

  const isLoading = signupMutation.isPending;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRef.current?.value || !nicknameRef.current?.value || !password || !passwordConfirm) {
      toast.warn('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      toast.warn('비밀번호가 일치하지 않습니다.');
      return;
    }

    signupMutation.mutate({
      email: emailRef.current.value,
      password,
      passwordConfirm,
      nickname: nicknameRef.current.value,
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} innerClassName={styles['modal']}>
      <form className={styles['auth']} onSubmit={onSubmit}>
        <h2 className={styles['auth__title']}>회원가입</h2>
        <div className={styles['auth__body']}>
          <div className={styles['auth__body-group']}>
            <span className={styles['auth__body-group__label']}>닉네임</span>
            <BaseInput
              ref={nicknameRef}
              type="text"
              placeholder="닉네임을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className={styles['auth__body-group']}>
            <span className={styles['auth__body-group__label']}>이메일</span>
            <BaseInput
              ref={emailRef}
              type="email"
              placeholder="이메일을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className={styles['auth__body-group']}>
            <span className={styles['auth__body-group__label']}>비밀번호</span>
            <PasswordInput
              value={password}
              placeholder="비밀번호를 입력하세요"
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles['auth__body-group']}>
            <span className={styles['auth__body-group__label']}>비밀번호 확인</span>
            <PasswordInput
              value={passwordConfirm}
              placeholder="비밀번호를 다시 입력하세요"
              onChange={e => setPasswordConfirm(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles['auth__social']}>
          <span className={styles['auth__social__or']}>OR</span>
          <div className={styles['auth__social__oauth']}>
            <button
              type="button"
              className={styles['auth__social__oauth--google']}
              onClick={() => {
                setTimeout(() => {
                  const btn = googleLoginButtonRef.current?.querySelector('div[role="button"]');
                  if (btn && typeof (btn as HTMLElement).click === 'function') {
                    (btn as HTMLElement).click();
                  } else {
                    toast.error('구글 버튼을 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
                  }
                }, 0);
              }}
            >
              <Image src={Google} alt="Google Logo" width={20} height={20} />
              <span>Google 계정으로 시작하기</span>
            </button>
            <div ref={googleLoginButtonRef} style={{ display: 'none' }}>
              <GoogleLogin
                onSuccess={credentialResponse => {
                  if (credentialResponse.credential) {
                    googleSignupMutation.mutate({ idToken: credentialResponse.credential });
                  } else {
                    toast.error('구글 회원가입에 실패했습니다.');
                  }
                }}
                onError={() => {
                  toast.error('구글 회원가입에 실패했습니다.');
                }}
                width={200}
              />
            </div>
          </div>
        </div>

        <div className={styles['auth__actions']}>
          <div>
            <span className={styles['auth__actions__boolean']}>이미 회원이신가요? </span>
            <button
              type="button"
              className={styles['auth__actions__link']}
              onClick={onLoginOpen}
              disabled={isLoading}
            >
              로그인하기
            </button>
          </div>

          <div className={styles['auth__actions__buttons']}>
            <Button
              type="button"
              variant="orange"
              mode="outline"
              className={styles['auth__actions__buttons__button']}
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </Button>

            <Button
              type="submit"
              variant="orange"
              className={styles['auth__actions__buttons__button']}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
