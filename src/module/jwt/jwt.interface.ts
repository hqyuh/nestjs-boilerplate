import { JwtSignOptions } from "@nestjs/jwt";

export abstract class IJwtService {
    /** 
	 * Generate access token
	 * @param payload data
	 * @param options 
	 * @return Promise<string>
	 */
	abstract sign(payload: JwtPayload, options?: Omit<JwtSignOptions, 'secret'>): Promise<string>;

    /** 
	 * Verify access token
     * @param token access_token
     * @return Promise<JwtPayload>
     */
	abstract verify(token: string): Promise<JwtPayload>;
}