import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleConfig } from '@/module/configs/interfaces/config.interface';

import { OauthProfileDto } from './dto/auth.dto';

type GoogleIdTokenPayload = {
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

@Injectable()
export class GoogleTokenVerifier {
  constructor(private readonly configService: ConfigService) {}

  async verify(idToken: string): Promise<OauthProfileDto> {
    const { clientId } = this.configService.getOrThrow<GoogleConfig>('app.google');
    const client = new OAuth2Client(clientId);
    let payload: GoogleIdTokenPayload | undefined;

    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return {
      providerAccountId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      avatarUrl: payload.picture,
      idToken,
    };
  }
}
