import { UserEntity } from '@/apis/user/entities/user.entity';
import { OAuthProvider } from '@/common/enums/oauth-provider.enum';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('oauth_account')
@Index(['userId'])
@Index(['provider', 'providerAccountId'], { unique: true })
export class OAuthAccountEntity extends BaseUuidEntity {

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: OAuthProvider,
  })
  provider: OAuthProvider;

  @Column({ name: 'provider_account_id' })
  providerAccountId: string;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'token_type', nullable: true })
  tokenType: string;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ name: 'id_token', type: 'text', nullable: true })
  idToken: string;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.oauthAccounts)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
