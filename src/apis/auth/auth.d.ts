import { UserEntity } from '@/apis/user/entities/user.entity';

declare global {
  type UserType = 'user';
  type User = UserEntity;
  type UserJwtPayload = {
    id: string;
    email: string;
    fisrtName: string;
    lastName: string;
    role: string;
    exp?: number;
    jti?: string;
  };
  type JwtPayload = UserJwtPayload;
}

export {};
