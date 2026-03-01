'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import BaseInput from '@/shared/components/Input/BaseInput/BaseInput';
import PasswordInput from '@/shared/components/Input/PasswordInput/PasswordInput';
import Button from '@/shared/components/Button/Button';

import { authServiceClient } from '@/services/backend/auth.api';
import { useAuthStore } from '@/domain/Auth/store/auth.store';

import styles from './EditProfileForm.module.scss';

interface EditProfileFormProps {
  initialNickname: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

interface EditProfileFormState {
  nickname: string;
  newPassword: string;
  confirmPassword: string;
}

const MIN_NICKNAME_LENGTH = 2;

export default function EditProfileForm({
  initialNickname,
  onSubmitSuccess,
  onCancel,
}: EditProfileFormProps) {
  const setUser = useAuthStore(state => state.setUser);

  const [formState, setFormState] = useState<EditProfileFormState>({
    nickname: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 초기 닉네임 세팅
  useEffect(() => {
    setFormState({
      nickname: initialNickname,
      newPassword: '',
      confirmPassword: '',
    });
  }, [initialNickname]);

  const trimmedNickname = formState.nickname.trim();
  const isNicknameChanged = trimmedNickname !== initialNickname;
  const isPasswordChanged =
    formState.newPassword.length > 0 || formState.confirmPassword.length > 0;

  const updateMeMutation = useMutation({
    mutationFn: (data: Auth.UpdateMeReq) => authServiceClient.updateMe(data),
    onSuccess: updatedUser => {
      setUser(updatedUser);
      toast.success('회원 정보가 수정되었습니다.');
      onSubmitSuccess();
    },
    onError: error => {
      console.error(error);
      toast.error('정보 수정에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const isSubmitDisabled = updateMeMutation.isPending || (!isNicknameChanged && !isPasswordChanged);

  const handleSubmit = () => {
    const { newPassword, confirmPassword } = formState;

    if (!isNicknameChanged && !isPasswordChanged) {
      toast.info('변경된 정보가 없습니다.');
      return;
    }

    if (isNicknameChanged && trimmedNickname.length < MIN_NICKNAME_LENGTH) {
      toast.warn('닉네임은 2자 이상 입력해주세요.');
      return;
    }

    if (isPasswordChanged) {
      if (!newPassword) {
        toast.warn('새 비밀번호를 입력해주세요.');
        return;
      }

      if (!confirmPassword) {
        toast.warn('비밀번호 확인을 입력해주세요.');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.warn('비밀번호가 일치하지 않습니다.');
        return;
      }

      if (newPassword.length < 8) {
        toast.warn('비밀번호는 8자 이상이어야 합니다.');
        return;
      }
    }

    updateMeMutation.mutate({
      ...(isNicknameChanged && { nickname: trimmedNickname }),
      ...(isPasswordChanged && { password: newPassword }),
    });
  };

  return (
    <form
      className={styles['edit-profile']}
      onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className={styles['edit-profile__body']}>
        <div className={styles['edit-profile__body-group']}>
          <label htmlFor="nickname" className={styles['edit-profile__body-group__label']}>
            닉네임
          </label>
          <BaseInput
            id="nickname"
            placeholder="변경할 닉네임"
            value={formState.nickname}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                nickname: e.target.value,
              }))
            }
          />
        </div>

        <div className={styles['edit-profile__body-group']}>
          <label htmlFor="newPassword" className={styles['edit-profile__body-group__label']}>
            새 비밀번호
          </label>
          <PasswordInput
            id="newPassword"
            placeholder="새 비밀번호 입력"
            value={formState.newPassword}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            autoComplete="new-password"
          />
        </div>

        <div className={styles['edit-profile__body-group']}>
          <label htmlFor="confirmPassword" className={styles['edit-profile__body-group__label']}>
            비밀번호 확인
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder="비밀번호 다시 입력"
            value={formState.confirmPassword}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className={styles['edit-profile__actions']}>
        <Button
          mode="outline"
          type="button"
          disabled={updateMeMutation.isPending}
          onClick={onCancel}
        >
          취소
        </Button>

        <Button mode="fill" type="submit" disabled={isSubmitDisabled}>
          {updateMeMutation.isPending ? '변경 중...' : '변경하기'}
        </Button>
      </div>
    </form>
  );
}
