'use client';

import { useEffect } from 'react';
import { ArrowLeft, LogIn, UserPlus, X } from 'lucide-react';
import type { RoomEntryStep } from '../hooks/useRoomEntry';

import styles from './RoomEntryModal.module.scss';

interface RoomEntryModalProps {
  step: RoomEntryStep;
  roomCode: string;
  error: string;
  isJoining: boolean;
  isCreating: boolean;
  onCreate: () => void;
  onSelectJoin: () => void;
  onJoin: () => void;
  onBack: () => void;
  onClose: () => void;
  onChangeCode: (value: string) => void;
}

export default function RoomEntryModal({
  step,
  roomCode,
  error,
  isJoining,
  isCreating,
  onCreate,
  onSelectJoin,
  onJoin,
  onBack,
  onClose,
  onChangeCode,
}: RoomEntryModalProps) {
  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div className={styles['room-entry-modal']} role="dialog" aria-modal="true">
      <div className={styles['room-entry-modal__backdrop']} onClick={onClose} aria-hidden="true" />

      <div className={styles['room-entry-modal__content']}>
        <header className={styles['room-entry-modal__header']}>
          {step === 'join' && (
            <button
              type="button"
              className={styles['room-entry-modal__back']}
              onClick={onBack}
              aria-label="이전 화면으로 돌아가기"
              disabled={isJoining || isCreating}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
          )}

          <h3 className={styles['room-entry-modal__title']}>같이 정하기</h3>

          <button
            type="button"
            className={styles['room-entry-modal__close']}
            onClick={onClose}
            aria-label="모달 닫기"
            disabled={isJoining || isCreating}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {step === 'select' && (
          <div className={styles['room-entry-modal__options']}>
            <button
              type="button"
              className={styles['room-entry-modal__option--primary']}
              onClick={onCreate}
              disabled={isCreating}
              aria-busy={isCreating}
            >
              <span className={styles['room-entry-modal__option-icon']} aria-hidden="true">
                <UserPlus size={20} />
              </span>
              <div>
                <strong>{isCreating ? '방 생성 중…' : '방 만들기'}</strong>
                <span>
                  {isCreating
                    ? '잠시만 기다려 주세요'
                    : '새 방을 만들고 친구에게 방 코드를 공유해요'}
                </span>
              </div>
            </button>

            <button
              type="button"
              className={styles['room-entry-modal__option--secondary']}
              onClick={onSelectJoin}
              disabled={isCreating}
            >
              <span className={styles['room-entry-modal__option-icon']} aria-hidden="true">
                <LogIn size={20} />
              </span>
              <div>
                <strong>방 코드로 입장하기</strong>
                <span>친구에게 받은 코드를 입력해요</span>
              </div>
            </button>
          </div>
        )}

        {step === 'join' && (
          <div className={styles['room-entry-modal__join']}>
            <input
              type="text"
              className={styles['room-entry-modal__input']}
              value={roomCode}
              onChange={e => onChangeCode(e.target.value)}
              placeholder="예: ABCD12"
              autoFocus
              disabled={isJoining}
              aria-label="방 코드 입력"
              onKeyDown={e => {
                if (e.key === 'Enter' && roomCode.length === 6 && !isJoining) {
                  onJoin();
                }
              }}
            />

            {error && (
              <p className={styles['room-entry-modal__error']} role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className={styles['room-entry-modal__join-button']}
              onClick={onJoin}
              disabled={isJoining || roomCode.length !== 6}
            >
              {isJoining ? '입장 중…' : '입장하기'}
            </button>

            {isJoining && (
              <p className={styles['room-entry-modal__loading']} aria-live="polite">
                입장 중이에요…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
