import { Role } from '@/apis/roles/entities/role.entity';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { hash } from 'argon2';
import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  /** Login account */
  @Column()
  username: string;

  /** Password */
  @ApiHideProperty()
  @Column()
  @Exclude()
  password: string;

  /**
   * Hash the password before saving the user to the database
   */
  @BeforeInsert()
  async beforeInsert() {
    this.password = await hash(this.password);
  }

  /**
   * First name of the user
   */
  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null;

  /**
   * Last name of the user
   */
  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null;

  /**
   * Activation status of the user
   */
  @ApiProperty({ description: 'Activation Status' })
  @Column({ default: true })
  isActive: boolean;

  /**
   * Role of the user
   */
  @ManyToOne(() => Role, {
    eager: true,
  })
  role?: Role | null;
}
