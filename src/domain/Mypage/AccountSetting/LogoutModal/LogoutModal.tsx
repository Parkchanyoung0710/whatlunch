'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';

import { authServiceClient } from '@/services/backend/auth.api';
import { useAuthStore } from '@/domain/Auth/store/auth.store';
import { disconnectSocket } from '@/lib/socket';

import styles from './LogoutModal.module.scss';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { clearUser } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: () => authServiceClient.postLogout(),
    onSuccess: () => {
      disconnectSocket();
      queryClient.clear();

      clearUser();

      toast.success('로그아웃 되었습니다.');
      onClose();

      setTimeout(() => {
        router.refresh();
      }, 100);

      router.push('/');
    },
    onError: error => {
      console.error('[LogoutModal] 로그아웃 실패:', error);
      toast.error('로그아웃에 실패했습니다.');
      setIsLoading(false);
    },
  });

  const handleLogout = useCallback(() => {
    setIsLoading(true);
    logoutMutation.mutate();
  }, [logoutMutation]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="로그아웃"
      description="정말 로그아웃하시겠어요?"
      innerClassName={styles['logout-modal']}
    >
      <div className={styles['logout-modal__actions']}>
        <Button mode="outline" type="button" onClick={onClose} disabled={isLoading}>
          취소
        </Button>

        <Button mode="fill" type="button" onClick={handleLogout} disabled={isLoading}>
          {isLoading ? '로그아웃 중...' : '로그아웃'}
        </Button>
      </div>
    </Modal>
  );
}
