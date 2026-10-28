import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AuthStrategy } from '@/apis/auth/auth.const';
import { OauthProfileDto } from '@/apis/auth/dto/auth.dto';
import { FacebookConfig } from '@/module/configs/interfaces/config.interface';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, AuthStrategy.FACEBOOK) {
  constructor(configService: ConfigService) {
    const facebook = configService.getOrThrow<FacebookConfig>('app.facebook');
    super({
      clientID: facebook.appId,
      clientSecret: facebook.appSecret,
      callbackURL: facebook.callbackUrl || 'http://localhost:3000/api/v1/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      enableProof: true,
      scope: ['email', 'public_profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile): OauthProfileDto {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Invalid Facebook token');
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
