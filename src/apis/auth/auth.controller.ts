import { ApiController } from '@/common/base/base.swagger';
import { User } from '@/common/decorator/user.decorator';
import { ValidationGuard } from '@/common/guards/validation.guard';
import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserEntity } from '../user/entities/user.entity';
import { AuthStrategy } from './auth.const';
import { IAuthService } from './auth.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@ApiController('Auth')
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  @Post('user/login')
  @UseGuards(ValidationGuard, AuthGuard(AuthStrategy.USER_LOCAL))
  @HttpCode(200)
  async loginUser(@Body() _loginUserDto: LoginUserDto, @User() user: UserEntity) {
    return this.authService.createToken(user);
  }

  @UseGuards(AuthGuard(AuthStrategy.USER_RF_JWT))
  @Post('user/refresh-token')
  async refreshToken(@User() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(AuthGuard(AuthStrategy.USER_RF_JWT))
  @Get('user/logout')
  async logout(@User() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto);
  }
}
