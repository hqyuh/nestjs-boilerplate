import { SuccessResponse } from '@/common/base/success-response';
import { Result } from '@/common/types/auth.dto';
import { Response } from 'express';
import { AuthTokens, LoginDTO, RegisterDTO } from './dto/auth.dto';

export abstract class IAuthService {
    abstract login(loginUserDto: LoginDTO, response: Response): Promise<SuccessResponse<AuthTokens>>;

    abstract register(registerDto: RegisterDTO): Promise<SuccessResponse<Result>>;

    abstract refreshToken(authTokens: AuthTokens, response: Response): Promise<SuccessResponse<AuthTokens>>;

    abstract logout(authTokens: AuthTokens): Promise<SuccessResponse<Result>>;
}