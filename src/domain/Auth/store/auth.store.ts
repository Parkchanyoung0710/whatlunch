import { create } from 'zustand';
import { resetSocket } from '@/lib/socket';

// 유저 정보 타입
type User = {
  id: string;
  email: string;
  nickname: string;
  profileImage: string | null;
};

type AuthState = {
  user: User | null;
  isAuthLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  finishAuthCheck: () => void;
  updateNickname: (nickname: string) => void;
  updateProfileImage: (profileImage: string | null) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthLoading: true,
  setUser: user => {
    set({ user, isAuthLoading: false });
    resetSocket(); // 소켓 재설정

    // 닉네임 변경 즉시 반영 이벤트
    if (typeof window !== 'undefined' && user?.nickname) {
      window.dispatchEvent(
        new CustomEvent('profile:nicknameUpdated', { detail: { nickname: user.nickname } })
      );
    }
  },
  clearUser: () => {
    set({ user: null, isAuthLoading: false });
    resetSocket(); // 소켓 재설정
  },
  finishAuthCheck: () => set({ isAuthLoading: false }),
  updateNickname: nickname => {
    let hasUser = false;
    set(state => {
      if (!state.user) return state;
      hasUser = true;
      const nextUser = { ...state.user, nickname };
      // 상태 반영
      return { ...state, user: nextUser };
    });

    if (hasUser && typeof window !== 'undefined' && nickname) {
      window.dispatchEvent(new CustomEvent('profile:nicknameUpdated', { detail: { nickname } }));
    }
  },
  updateProfileImage: profileImage => {
    let hasUser = false;
    set(state => {
      if (!state.user) return state;
      hasUser = true;
      const nextUser = { ...state.user, profileImage };
      return { ...state, user: nextUser };
    });
    // 프로필 이미지 변경 즉시 반영 이벤트
    if (hasUser && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profile:imageUpdated', { detail: { profileImage } }));
    }
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('auth:expired', () => {
    useAuthStore.getState().clearUser();
  });
}
