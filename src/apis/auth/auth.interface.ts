import { Response } from 'express';
import { SuccessResponse } from '@/common/base/success-response';
import { Result } from '@/common/types/auth.dto';

import { AuthTokens, LoginDTO, OauthProfileDto, RegisterDTO } from './dto/auth.dto';

/**
 * Nest cannot inject an interface: TypeScript erases it at runtime.
 * This Symbol is the runtime DI token used with `@Inject(IAuthService)`
 * and `{ provide: IAuthService, useClass: AuthService }`.
 */
export const IAuthService = Symbol('IAuthService');

export interface IAuthService {
  login(loginUserDto: LoginDTO, response: Response): Promise<SuccessResponse<AuthTokens>>;
  register(registerDto: RegisterDTO): Promise<SuccessResponse<Result>>;
  loginWithGoogle(profile: OauthProfileDto, response: Response): Promise<SuccessResponse<AuthTokens>>;
  loginWithGoogleIdToken(idToken: string, response: Response): Promise<SuccessResponse<AuthTokens>>;
  loginWithFacebook(profile: OauthProfileDto, response: Response): Promise<SuccessResponse<AuthTokens>>;
  loginWithFacebookAccessToken(accessToken: string, response: Response): Promise<SuccessResponse<AuthTokens>>;
  refreshToken(authTokens: AuthTokens, response: Response): Promise<SuccessResponse<AuthTokens>>;
  logout(authTokens: AuthTokens): Promise<SuccessResponse<Result>>;
}
