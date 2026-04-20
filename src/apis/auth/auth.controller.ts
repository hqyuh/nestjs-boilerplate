import { ApiController } from '@/common/base/base.swagger';
import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthStrategy } from './auth.const';
import { IAuthService } from './auth.interface';
import { CookieJwt } from './decorator/cookie-jwt.decorator';
import { AuthTokens, LoginDTO, RegisterDTO } from './dto/auth.dto';

@Controller({ path: 'auth', version: ['1', '2'] })
@ApiController('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

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
}
