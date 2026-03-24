import { OAuthAccountEntity } from '@/apis/auth/entities/oauth-account.entity';
import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';
import { hash } from 'argon2';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'user' })
export class UserEntity extends BaseUuidEntity {
  @Column({ unique: true })
  email: string;

  @Index()
  @Column({ name: 'first_name', nullable: true })
  firstName: string | null;

  @Column({ name: 'middle_name', nullable: true })
  middleName: string | null;

  @Index()
  @Column({ name: 'last_name', nullable: true })
  lastName: string | null;

  @Column({ name: 'password', type: 'text', nullable: true })
  password: string | null;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string | null;

  @ManyToOne(() => RoleEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity | null;

  @OneToMany(() => OAuthAccountEntity, (oauthAccount) => oauthAccount.user)
  oauthAccounts: OAuthAccountEntity[];

  /**
   * Hash the password before saving/updating the user to the database
   */
  @BeforeInsert()
  @BeforeUpdate()
  async beforePersist() {
    this.password = await hash(this.password);
  }
}
