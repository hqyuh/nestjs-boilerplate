import { AccessControlLists, Token } from '@/common/enums/auth.enum';
import { ICacheService } from '@/module/cache/cache.interface';
import { IJwtService } from '@/module/jwt/jwt.interface';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { IUserService } from '../user/interface/user.interface';
import { AuthService } from './auth.service';
import { AuthTokens, LoginDTO, RegisterDTO } from './dto/auth.dto';

jest.mock('node:crypto', () => {
  const actual = jest.requireActual('node:crypto');
  return {
    ...actual,
    randomUUID: jest.fn(),
  };
});

jest.mock('@/common/logger/logger', () => ({
  logger: {
    write: jest.fn(),
    getMessage: jest.fn(() => 'mocked-message'),
    writeWithError: jest.fn(),
    writeWithParameter: jest.fn(),
  },
  MsgIds: {
    M005001: 'M005-001',
    M005002: 'M005-002',
  },
}));

import { randomUUID } from 'node:crypto';

const APP_CONFIG = {
  jwt: {
    secret: 'test-secret',
    expirationTime: 3600,
    refreshTime: 86400,
  },
  cookie: {
    sameSite: 'lax',
    maxAge: 86400000,
  },
};

const buildMockResponse = () => {
  const res = {
    cookie: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<IJwtService>;
  let configService: jest.Mocked<ConfigService>;
  let cacheService: jest.Mocked<ICacheService>;
  let userService: jest.Mocked<IUserService>;
  let i18n: jest.Mocked<I18nService>;

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<IJwtService>;

    configService = {
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    cacheService = {
      set: jest.fn(),
      setMany: jest.fn().mockResolvedValue(true),
      get: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<ICacheService>;

    userService = {
      validateUserByEmailPassword: jest.fn(),
      validateUserById: jest.fn(),
      createUser: jest.fn(),
      getAllUserPaginated: jest.fn(),
      getOneUserById: jest.fn(),
      removeUserById: jest.fn(),
      updateUserById: jest.fn(),
      getOne: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUserService>;

    i18n = {
      t: jest.fn().mockImplementation((key: string) => Promise.resolve(key)),
    } as unknown as jest.Mocked<I18nService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: IJwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: ICacheService, useValue: cacheService },
        { provide: IUserService, useValue: userService },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    (randomUUID as jest.Mock).mockReturnValueOnce('access-jti').mockReturnValueOnce('refresh-jti');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDTO = { email: 'user@example.com', password: 'password123' };
    const mockUser = {
      id: 'user-id',
      email: loginDto.email,
      firstName: 'John',
      lastName: 'Doe',
      role: { name: 'user' },
    };

    it('logs in successfully and stores tokens to whitelist', async () => {
      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'app') return APP_CONFIG;
        if (key === 'app.jwt') return APP_CONFIG.jwt;
        return undefined;
      });
      userService.validateUserByEmailPassword.mockResolvedValue(mockUser as never);
      jwtService.sign.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      const response = buildMockResponse();
      const result = await service.login(loginDto, response);

      expect(userService.validateUserByEmailPassword).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          id: 'user-id',
          email: loginDto.email,
          fisrtName: 'John',
          lastName: 'Doe',
          role: 'user',
        }),
        { expiresIn: APP_CONFIG.jwt.expirationTime, jwtid: 'access-jti' }
      );
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, expect.any(Object), {
        expiresIn: APP_CONFIG.jwt.refreshTime,
        jwtid: 'refresh-jti',
      });
      expect(cacheService.setMany).toHaveBeenCalledWith([
        {
          key: `${AccessControlLists.WHITE}:${Token.ACCESS}:access-jti`,
          value: 'access-token',
          ttl: APP_CONFIG.jwt.expirationTime * 1000,
        },
        {
          key: `${AccessControlLists.WHITE}:${Token.REFRESH}:refresh-jti`,
          value: 'refresh-token',
          ttl: APP_CONFIG.jwt.refreshTime * 1000,
        },
      ]);
      expect(response.cookie).toHaveBeenCalledWith(Token.REFRESH, 'refresh-token', {
        httpOnly: true,
        sameSite: APP_CONFIG.cookie.sameSite,
        maxAge: APP_CONFIG.cookie.maxAge,
      });
      expect(result.data).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(result.messages).toBe('auth.login_success');
    });
  });

  describe('register', () => {
    const registerDto: RegisterDTO = {
      email: 'new-user@example.com',
      password: 'password',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('throws ConflictException when user already exists', async () => {
      userService.getOne.mockResolvedValue({ id: 'existing-id' } as never);

      await expect(service.register(registerDto)).rejects.toBeInstanceOf(ConflictException);
      expect(userService.create).not.toHaveBeenCalled();
    });

    it('creates the user and returns success response', async () => {
      userService.getOne.mockResolvedValue(null);
      userService.create.mockResolvedValue({ id: 'new-id' } as never);

      const result = await service.register(registerDto);

      expect(userService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
      expect(result.data).toEqual({ success: true });
      expect(result.messages).toBe('auth.register_success');
    });
  });

  describe('refreshToken', () => {
    const tokens: AuthTokens = { accessToken: 'old-access', refreshToken: 'old-refresh' };
    const mockUser = {
      id: 'user-id',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: { name: 'admin' },
    };

    beforeEach(() => {
      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'app') return APP_CONFIG;
        if (key === 'app.jwt') return APP_CONFIG.jwt;
        return undefined;
      });
      jwtService.verify
        .mockResolvedValueOnce({ id: 'user-id', jti: 'old-access-jti' } as never)
        .mockResolvedValueOnce({ id: 'user-id', jti: 'old-refresh-jti' } as never);
      userService.getOne.mockResolvedValue(mockUser as never);
    });

    it('throws UnauthorizedException when cached refresh token is missing', async () => {
      cacheService.get.mockResolvedValue(null);

      await expect(service.refreshToken(tokens, buildMockResponse())).rejects.toBeInstanceOf(
        UnauthorizedException
      );
      expect(cacheService.deleteMany).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when cached refresh token does not match', async () => {
      cacheService.get.mockResolvedValue('different-refresh');

      await expect(service.refreshToken(tokens, buildMockResponse())).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    it('rotates tokens and returns success response on valid refresh', async () => {
      cacheService.get.mockResolvedValue(tokens.refreshToken);
      jwtService.sign.mockResolvedValueOnce('new-access').mockResolvedValueOnce('new-refresh');

      const response = buildMockResponse();
      const result = await service.refreshToken(tokens, response);

      expect(cacheService.deleteMany).toHaveBeenCalledWith([
        `${AccessControlLists.WHITE}:${Token.ACCESS}:old-access-jti`,
        `${AccessControlLists.WHITE}:${Token.REFRESH}:old-refresh-jti`,
      ]);
      expect(response.cookie).toHaveBeenCalledWith(Token.REFRESH, 'new-refresh', {
        httpOnly: true,
        sameSite: APP_CONFIG.cookie.sameSite,
        maxAge: APP_CONFIG.cookie.maxAge,
      });
      expect(cacheService.setMany).toHaveBeenCalledWith([
        {
          key: `${AccessControlLists.WHITE}:${Token.ACCESS}:access-jti`,
          value: 'new-access',
          ttl: APP_CONFIG.jwt.expirationTime * 1000,
        },
        {
          key: `${AccessControlLists.WHITE}:${Token.REFRESH}:refresh-jti`,
          value: 'new-refresh',
          ttl: APP_CONFIG.jwt.refreshTime * 1000,
        },
      ]);
      expect(result.data).toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
      expect(result.messages).toBe('auth.refresh_token_success');
    });
  });

  describe('logout', () => {
    const tokens: AuthTokens = { accessToken: 'access', refreshToken: 'refresh' };

    it('throws UnauthorizedException when access payload is invalid', async () => {
      jwtService.verify
        .mockResolvedValueOnce(null as never)
        .mockResolvedValueOnce({ jti: 'refresh-jti' } as never);

      await expect(service.logout(tokens)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(cacheService.deleteMany).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when refresh payload is invalid', async () => {
      jwtService.verify
        .mockResolvedValueOnce({ jti: 'access-jti' } as never)
        .mockResolvedValueOnce(null as never);

      await expect(service.logout(tokens)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('moves tokens from whitelist to blacklist on success', async () => {
      jwtService.verify
        .mockResolvedValueOnce({ jti: 'access-jti' } as never)
        .mockResolvedValueOnce({ jti: 'refresh-jti' } as never);

      const result = await service.logout(tokens);

      expect(cacheService.deleteMany).toHaveBeenCalledWith([
        `${AccessControlLists.WHITE}:${Token.ACCESS}:access-jti`,
        `${AccessControlLists.WHITE}:${Token.REFRESH}:refresh-jti`,
      ]);
      const blacklistTtl = 7 * 24 * 60 * 60 * 1000;
      expect(cacheService.setMany).toHaveBeenCalledWith([
        {
          key: `${AccessControlLists.BLACK}:${Token.ACCESS}:access-jti`,
          value: tokens.accessToken,
          ttl: blacklistTtl,
        },
        {
          key: `${AccessControlLists.BLACK}:${Token.REFRESH}:refresh-jti`,
          value: tokens.refreshToken,
          ttl: blacklistTtl,
        },
      ]);
      expect(result.data).toEqual({ success: true });
      expect(result.messages).toBe('auth.logout_success');
    });
  });
});
