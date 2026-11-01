import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '@/apis/user/entities/user.entity';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';

@Entity('user_session')
@Index(['userId'])
@Index(['refreshJti'], { unique: true })
export class UserSessionEntity extends BaseUuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'refresh_jti', type: 'varchar' })
  refreshJti: string;

  @Column({ name: 'access_jti', type: 'varchar' })
  accessJti: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName: string | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @ManyToOne(
    () => UserEntity,
    (user) => user.sessions
  )
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
