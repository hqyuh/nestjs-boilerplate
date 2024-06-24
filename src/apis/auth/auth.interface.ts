import { RefreshTokenDto } from "./dto/refresh-token.dto";

export abstract class IAuthService {
    abstract createToken(user: User);

    abstract refreshToken(refreshTokenDto: RefreshTokenDto);

    abstract logout(refreshTokenDto: RefreshTokenDto);
}