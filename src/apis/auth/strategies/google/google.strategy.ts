import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthStrategy } from '@/apis/auth/auth.const';
import { OauthProfileDto } from '@/apis/auth/dto/auth.dto';
import { GoogleConfig } from '@/module/configs/interfaces/config.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, AuthStrategy.GOOGLE) {
  constructor(configService: ConfigService) {
    const google = configService.getOrThrow<GoogleConfig>('app.google');
    super({
      clientID: google.clientId,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackUrl || 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile): OauthProfileDto {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return {
      providerAccountId: profile.id,
      email,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      avatarUrl: profile.photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
  }
}
