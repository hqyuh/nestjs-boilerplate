import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ApiController } from '@/common/base/base.swagger';
import { SuccessResponse } from '@/common/base/success-response';
import { FacebookConfig, GoogleConfig } from '@/module/configs/interfaces/config.interface';

import { AuthStrategy } from './auth.const';
import { IAuthService } from './auth.interface';
import { CookieJwt } from './decorator/cookie-jwt.decorator';
import {
  AuthTokens,
  FacebookAccessTokenDto,
  GoogleIdTokenDto,
  LoginDTO,
  OauthProfileDto,
  RegisterDTO,
} from './dto/auth.dto';

@Controller({ path: 'auth', version: ['1', '2'] })
@ApiController('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    @Inject(IAuthService) private readonly authService: IAuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('login')
  @HttpCode(200)
  async loginUser(@Body() loginDto: LoginDTO, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(loginDto, response);
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDTO) {
    return this.authService.register(registerDto);
  }

  @Get('google')
  @ApiOperation({
    summary: 'Google login for web',
    description:
      'Open this URL in the browser to redirect to Google. Swagger Try it out returns the Google URL as JSON because fetch cannot follow that redirect.',
  })
  googleAuth(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const url = this.buildGoogleAuthorizationUrl();
    if (request.headers['sec-fetch-mode'] === 'navigate') {
      response.redirect(url);
      return;
    }
    return new SuccessResponse({
      data: { url },
      message: 'Open this URL in the browser to continue Google login',
    });
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback for web (Google redirects here)' })
  @UseGuards(AuthGuard(AuthStrategy.GOOGLE))
  async googleCallback(@Req() request: Request, @Res() response: Response) {
    const result = await this.authService.loginWithGoogle(request.user as OauthProfileDto, response);
    const { frontendRedirect } = this.configService.getOrThrow<GoogleConfig>('app.google');
    return this.finishOauthWebCallback(request, response, result, frontendRedirect);
  }

  @Post('google/mobile')
  @HttpCode(200)
  @ApiOperation({ summary: 'Google login for mobile — send idToken from Google Sign-In SDK' })
  async googleMobileAuth(@Body() dto: GoogleIdTokenDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.loginWithGoogleIdToken(dto.idToken, response);
  }

  @Get('facebook')
  @ApiOperation({
    summary: 'Facebook login for web',
    description:
      'Open this URL in the browser to redirect to Facebook. Swagger Try it out returns the Facebook URL as JSON because fetch cannot follow that redirect.',
  })
  facebookAuth(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const url = this.buildFacebookAuthorizationUrl();
    if (request.headers['sec-fetch-mode'] === 'navigate') {
      response.redirect(url);
      return;
    }
    return new SuccessResponse({
      data: { url },
      message: 'Open this URL in the browser to continue Facebook login',
    });
  }

  @Get('facebook/callback')
  @ApiOperation({ summary: 'Facebook OAuth callback for web (Facebook redirects here)' })
  @UseGuards(AuthGuard(AuthStrategy.FACEBOOK))
  async facebookCallback(@Req() request: Request, @Res() response: Response) {
    const result = await this.authService.loginWithFacebook(request.user as OauthProfileDto, response);
    const { frontendRedirect } = this.configService.getOrThrow<FacebookConfig>('app.facebook');
    return this.finishOauthWebCallback(request, response, result, frontendRedirect);
  }

  @Post('facebook/mobile')
  @HttpCode(200)
  @ApiOperation({ summary: 'Facebook login for mobile — send accessToken from Facebook Login SDK' })
  async facebookMobileAuth(@Body() dto: FacebookAccessTokenDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.loginWithFacebookAccessToken(dto.accessToken, response);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UseGuards(AuthGuard(AuthStrategy.USER_RF_JWT))
  async refreshToken(@CookieJwt() authTokens: AuthTokens, @Res({ passthrough: true }) response: Response) {
    return this.authService.refreshToken(authTokens, response);
  }

  @Get('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT))
  async logout(@CookieJwt() authTokens: AuthTokens) {
    return this.authService.logout(authTokens);
  }

  private finishOauthWebCallback(
    request: Request,
    response: Response,
    result: SuccessResponse<AuthTokens>,
    frontendRedirect: string
  ) {
    if (frontendRedirect) {
      return response.redirect(frontendRedirect);
    }
    return response.json({
      status: 200,
      data: result.data,
      message: result.messages,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }

  private buildGoogleAuthorizationUrl(): string {
    const google = this.configService.getOrThrow<GoogleConfig>('app.google');
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', google.clientId);
    url.searchParams.set('redirect_uri', google.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email profile');
    return url.toString();
  }

  private buildFacebookAuthorizationUrl(): string {
    const facebook = this.configService.getOrThrow<FacebookConfig>('app.facebook');
    const url = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    url.searchParams.set('client_id', facebook.appId);
    url.searchParams.set('redirect_uri', facebook.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email,public_profile');
    return url.toString();
  }
}
