import { Suspense } from 'react';

import { authServiceServer } from '@/services/backend/auth.api';
import HeaderClient from './HeaderClient';
/**
 *
 * @description 헤더는 서버 컴포넌트입니다. 클라이언트 컴포넌트로 변경하지 마세요.
 */
async function HeaderContent() {
  try {
    const user = await authServiceServer.getMe();
    return <HeaderClient user={user} />;
  } catch {
    return <HeaderClient user={null} />;
  }
}

// TODO: fallback 스켈레톤 UI로 교체 필요
export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
}
