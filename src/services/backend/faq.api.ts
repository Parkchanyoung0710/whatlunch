import { fetcherClient } from '@/lib/fetcher-client';
import { fetcherServer } from '@/lib/fetcher-server';

interface Fetcher {
  <T>(url: string, options?: RequestInit): Promise<T>;
}

class FaqService {
  constructor(private fetcher: Fetcher) {}
  // 문의 등록
  postFaq(data: Faq.CreateFaqReq): Promise<{ faq: Faq.CreateFaqRes['faq'] }> {
    return this.fetcher<{ faq: Faq.CreateFaqRes['faq'] }>('/faq', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 문의 목록 조회
  getFaqs(): Promise<Faq.GetFaqsRes[]> {
    return this.fetcher<Faq.GetFaqsRes[]>('/faq', {
      method: 'GET',
    });
  }
}

export const faqServiceClient = new FaqService(fetcherClient);
export const faqServiceServer = new FaqService(fetcherServer);
