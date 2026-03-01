import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let lastToken: string | undefined = undefined; // 마지막으로 사용된 토큰

const getSocketUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!url) {
    throw new Error('[Socket] NEXT_PUBLIC_SOCKET_URL is not defined.');
  }
  return url;
};

// 현재 쿠키에서 accessToken 추출
const getAccessToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(c => c.startsWith('accessToken='));
  if (!tokenCookie) return undefined;

  return tokenCookie.split('=').slice(1).join('=');
};

// 쿠키에 accessToken이 설정될 때까지 대기
const waitForAccessToken = async (maxRetries = 10, delayMs = 50): Promise<string | undefined> => {
  for (let i = 0; i < maxRetries; i++) {
    const token = getAccessToken();
    if (token) {
      if (i > 0) {
        console.log(`[Socket] 쿠키 확인 성공 (${i + 1}번째 시도)`);
      }
      return token;
    }

    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.warn('[Socket] 쿠키 대기 시간 초과');
  return undefined;
};

export const createSocket = async (forceNew = false): Promise<Socket | null> => {
  // 쿠키가 설정될 때까지 대기
  const currentToken = await waitForAccessToken();

  // 토큰이 없으면 소켓 생성 안 함
  if (!currentToken) {
    console.warn('[Socket] 토큰 없음, 소켓 생성 중단');
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
      lastToken = undefined;
    }
    return null;
  }

  // 토큰이 변경되었으면 기존 소켓 제거
  if (lastToken && lastToken !== currentToken) {
    console.log('[Socket] 토큰 변경 감지, 소켓 재생성', {
      oldTokenLength: lastToken.length,
      newTokenLength: currentToken.length,
    });
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
  }

  // 강제 재생성 또는 소켓이 없는 경우
  if (forceNew || !socket) {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    try {
      const apiUrl = getSocketUrl();

      const socketOptions: Parameters<typeof io>[1] = {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        withCredentials: true, // 쿠키 자동 전송
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        auth: {
          token: currentToken, // 현재 토큰으로 인증
        },
      };

      socket = io(apiUrl, socketOptions);
      lastToken = currentToken;

      return socket;
    } catch {
      return null;
    }
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;

// 소켓 완전 제거
export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    lastToken = undefined;
  }
};

export const isSocketConnected = (): boolean => socket?.connected ?? false;

// 소켓 재설정 (토큰 변경 시도)
export const resetSocket = (): void => {
  disconnectSocket();
};
