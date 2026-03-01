// 공유 결과 타입 명시
export type ShareResult = { ok: true } | { ok: false; cancelled?: boolean; error?: Error };

// Web Share API 지원 여부 미리 체크 가능하도록 함수 제공
export const isShareSupported = () => typeof navigator !== 'undefined' && !!navigator.share;

// 공유하기 유틸 함수
export async function shareContent(title: string, text: string): Promise<ShareResult> {
  // 브라우저가 공유 기능을 지원하지 않는 경우
  if (!isShareSupported()) {
    return { ok: false, error: new Error('Web Share API not supported') };
  }

  try {
    await navigator.share({ title, text });
    return { ok: true };
  } catch (error: unknown) {
    // 사용자가 공유창을 닫은 경우
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, cancelled: true };
    }

    // 알 수 없는 오류
    return { ok: false, error: error instanceof Error ? error : new Error('Unknown share error') };
  }
}
