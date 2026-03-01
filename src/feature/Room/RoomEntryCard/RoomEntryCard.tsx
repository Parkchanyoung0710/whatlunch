'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users } from 'lucide-react';
import { toast } from 'react-toastify';

import { useAuthStore } from '@/feature/Auth/store/auth.store';
import Button from '@/shared/components/Button/Button';
import { useRoomEntry } from '../hooks/useRoomEntry';
import RoomEntryModal from '../RoomEntryModal/RoomEntryModal';

import styles from './RoomEntryCard.module.scss';

type Mode = 'together' | 'solo';

export default function RoomEntryCard() {
  const router = useRouter();
  const room = useRoomEntry();

  const [mode, setMode] = useState<Mode>('together');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 실시간 유저 상태 (Zustand)
  const user = useAuthStore(state => state.user);

  const handleTogetherClick = useCallback(() => {
    // 비로그인 상태 체크
    if (!user) {
      toast.warn('같이 정하기는 로그인 후 이용할 수 있습니다.');
      return;
    }

    // 로그인 상태면 모달 열기
    setIsModalOpen(true);
    room.setStep('select');
  }, [user, room]);

  return (
    <>
      <section className={styles['room-entry']} aria-label="메뉴 추천 방식 선택">
        <header className={styles['room-entry__header']}>
          <h2 className={styles['room-entry__header__title']}>같이 정해볼까요?</h2>
          <p className={styles['room-entry__header__description']}>정하는 방법을 선택해보세요</p>
        </header>

        <div className={styles['room-entry__tabs']}>
          <button
            type="button"
            className={`${styles['room-entry__tab']} ${
              mode === 'together' ? styles['room-entry__tab--active'] : ''
            }`}
            onClick={() => setMode('together')}
          >
            같이 정하기
          </button>

          <button
            type="button"
            className={`${styles['room-entry__tab']} ${
              mode === 'solo' ? styles['room-entry__tab--active'] : ''
            }`}
            onClick={() => setMode('solo')}
          >
            혼자 정하기
          </button>
        </div>

        {mode === 'together' && (
          <>
            <div className={styles['room-entry__description-box']}>
              <p className={styles['room-entry__description-box__main']}>
                친구들과 실시간으로 룰렛과 채팅을 할 수 있어요
              </p>
              <span className={styles['room-entry__description-box__sub']}>
                방을 만들면 6자리 코드가 생성돼요
              </span>
            </div>
            <Button
              variant="orange"
              size="lg"
              className={styles['room-entry__button--active']}
              onClick={handleTogetherClick}
            >
              <Users size={18} aria-hidden="true" />
              같이 정하기
            </Button>
          </>
        )}

        {mode === 'solo' && (
          <>
            <div className={styles['room-entry__description-box--solo']}>
              로그인 없이 바로 메뉴를 추천받을 수 있어요
            </div>
            <Button
              variant="orange"
              size="lg"
              className={styles['room-entry__button--active']}
              onClick={() => router.push('/rooms/solo')}
            >
              <User size={18} aria-hidden="true" />
              혼자 정하기
            </Button>
          </>
        )}
      </section>

      {isModalOpen && (
        <RoomEntryModal
          step={room.step}
          roomCode={room.roomCodeRaw}
          error={room.error}
          isJoining={room.isJoining}
          isCreating={room.isCreating}
          onCreate={room.createRoom}
          onSelectJoin={() => room.setStep('join')}
          onJoin={room.joinRoom}
          onBack={room.resetJoin}
          onClose={() => setIsModalOpen(false)}
          onChangeCode={room.changeRoomCode}
        />
      )}
    </>
  );
}
