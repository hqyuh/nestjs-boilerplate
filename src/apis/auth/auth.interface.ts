import { RefreshTokenDto, TokenDto } from './dto/refresh-token.dto';
import { CreateTokenResponse } from '@/common/types/auth.dto';

export abstract class IAuthService {
    abstract createToken(user: User): Promise<CreateTokenResponse>;

    abstract refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenDto>;

    abstract logout(refreshTokenDto: RefreshTokenDto): any;
}