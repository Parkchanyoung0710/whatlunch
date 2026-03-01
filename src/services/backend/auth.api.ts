import { fetcherClient } from '@/lib/fetcher-client';
import { fetcherServer } from '@/lib/fetcher-server';

interface Fetcher {
  <T>(url: string, options?: RequestInit): Promise<T>;
}

class AuthService {
  constructor(private fetcher: Fetcher) {}

  postSignup(data: Auth.RegisterReq): Promise<Auth.MeRes> {
    return this.fetcher<Auth.MeRes>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async postLogin(data: Auth.LoginReq): Promise<Auth.LoginRes> {
    return await this.fetcher<Auth.LoginRes>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async postLogout(): Promise<void> {
    await this.fetcher('/auth/logout', {
      method: 'POST',
    });
  }

  getMe(): Promise<Auth.MeRes> {
    return this.fetcher<Auth.MeRes>('/auth/me', {
      method: 'GET',
    });
  }

  async refresh(): Promise<{ user: Auth.MeRes }> {
    return this.fetcher<{ user: Auth.MeRes }>('/auth/refresh', {
      method: 'POST',
    });
  }

  updateMe(data: Auth.UpdateMeReq): Promise<Auth.MeRes> {
    return this.fetcher<Auth.MeRes>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteProfileImage(): Promise<Auth.MeRes> {
    return this.fetcher<Auth.MeRes>('/auth/me/profile-image', {
      method: 'DELETE',
    });
  }

  createProfileImagePresign(contentType: string): Promise<{
    uploadUrl: string;
    fileUrl: string;
  }> {
    return this.fetcher('/auth/profile-image/presign', {
      method: 'POST',
      body: JSON.stringify({ contentType }),
    });
  }

  // 구글 로그인
  async loginWithGoogle({ idToken }: { idToken: string }): Promise<Auth.LoginRes> {
    const res = await this.fetcher<Auth.LoginRes>('/auth/oauth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    return res;
  }
}

export const authServiceClient = new AuthService(fetcherClient);
export const authServiceServer = new AuthService(fetcherServer);
