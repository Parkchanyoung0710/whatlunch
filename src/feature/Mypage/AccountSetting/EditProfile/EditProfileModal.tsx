'use client';
import { useCallback } from 'react';

import Modal from '@/shared/components/Modal/Modal';
import EditProfileForm from './EditProfileForm';
import { useAuthStore } from '@/feature/Auth/store/auth.store';

// 개인 정보 수정 모달
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const user = useAuthStore(state => state.user);

  // 닉네임 변경 후 처리
  const handleSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="개인 정보 수정"
      description="닉네임과 비밀번호를 변경할 수 있어요!"
      innerClassName="edit-profile-modal"
    >
      <EditProfileForm
        initialNickname={user.nickname}
        onSubmitSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
}
