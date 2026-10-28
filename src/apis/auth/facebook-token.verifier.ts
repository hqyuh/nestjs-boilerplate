import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FacebookConfig } from '@/module/configs/interfaces/config.interface';

import { OauthProfileDto } from './dto/auth.dto';

type FacebookDebugResponse = {
  data?: { app_id?: string; is_valid?: boolean };
  error?: { message?: string };
};

type FacebookMeResponse = {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  picture?: { data?: { url?: string } };
  error?: { message?: string };
};

@Injectable()
export class FacebookTokenVerifier {
  constructor(private readonly configService: ConfigService) {}

  async verify(accessToken: string): Promise<OauthProfileDto> {
    const facebook = this.configService.getOrThrow<FacebookConfig>('app.facebook');

    if (facebook.appId && facebook.appSecret) {
      const debug = await this.graph<FacebookDebugResponse>(
        `/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${facebook.appId}|${facebook.appSecret}`)}`
      );
      if (!debug.data?.is_valid || debug.data.app_id !== facebook.appId) {
        throw new UnauthorizedException('Invalid Facebook token');
      }
    }

    const me = await this.graph<FacebookMeResponse>(
      `/me?fields=id,email,first_name,last_name,picture.width(512)&access_token=${encodeURIComponent(accessToken)}`
    );
    if (!me.id || !me.email) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    return {
      providerAccountId: me.id,
      email: me.email,
      firstName: me.first_name,
      lastName: me.last_name,
      avatarUrl: me.picture?.data?.url,
      accessToken,
    };
  }

  private async graph<T extends { error?: { message?: string } }>(path: string): Promise<T> {
    let body: T;
    try {
      const response = await fetch(`https://graph.facebook.com${path}`);
      body = (await response.json()) as T;
      if (!response.ok) {
        throw new UnauthorizedException('Invalid Facebook token');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Facebook token');
    }

    if (body.error) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
    return body;
  }
}
