import { JwtSignOptions } from '@nestjs/jwt';

/**
 * Nest cannot inject an interface: TypeScript erases it at runtime.
 * This Symbol is the runtime DI token used with `@Inject(IJwtService)`
 * and `{ provide: IJwtService, useClass: JwtService }`.
 */
export const IJwtService = Symbol('IJwtService');

export interface IJwtService {
  /**
   * Generate access token
   * @param payload data
   * @param options
   * @return Promise<string>
   */
  sign(payload: JwtPayload, options?: Omit<JwtSignOptions, 'secret'>): Promise<string>;

  /**
   * Verify access token
   * @param token access_token
   * @return Promise<JwtPayload>
   */
  verify(token: string): Promise<JwtPayload>;
}
