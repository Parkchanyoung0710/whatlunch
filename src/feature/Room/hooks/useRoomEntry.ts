'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { getApiBaseUrl } from '@/shared/hooks/getApiBaseUrl';

export type RoomEntryStep = 'select' | 'join';

const ROOM_CODE_LENGTH = 6;

export function useRoomEntry() {
  const router = useRouter();

  const [step, setStep] = useState<RoomEntryStep>('select');
  const [roomCodeRaw, setRoomCodeRaw] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 방 생성
  const createRoom = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setError('');
    try {
      const API_BASE_URL = getApiBaseUrl();

      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        toast.error('방 생성에 실패했어요.');
        return;
      }

      const { roomCode } = await res.json();
      router.push(`/rooms/${roomCode}`);

      // 성공 시에만 단계 초기화
      setStep('select');
    } catch {
      toast.error('서버에 연결할 수 없어요.');
    } finally {
      // 로딩 상태만 정리
      setIsCreating(false);
    }
  };

  // 방 코드 입력
  const changeRoomCode = (value: string) => {
    const parsed = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, ROOM_CODE_LENGTH);

    setRoomCodeRaw(parsed);
    if (error) setError('');
  };

  // 방 입장
  const joinRoom = async () => {
    if (roomCodeRaw.length !== ROOM_CODE_LENGTH) {
      setError('방 코드를 6자리로 입력해 주세요.');
      return;
    }

    if (isJoining) return;
    setIsJoining(true);
    setError('');

    try {
      const API_BASE_URL = getApiBaseUrl();
      const res = await fetch(`${API_BASE_URL}/rooms/${roomCodeRaw}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        setError('존재하지 않는 방이에요.');
        return;
      }

      router.push(`/rooms/${roomCodeRaw}`);
    } catch {
      setError('방 정보를 확인할 수 없어요.');
    } finally {
      setIsJoining(false);
    }
  };

  const resetJoin = () => {
    setRoomCodeRaw('');
    setError('');
    setIsJoining(false);
    setStep('select');
  };

  return {
    step,
    setStep,
    roomCodeRaw,
    error,
    isJoining,
    isCreating,
    createRoom,
    changeRoomCode,
    joinRoom,
    resetJoin,
  };
}
