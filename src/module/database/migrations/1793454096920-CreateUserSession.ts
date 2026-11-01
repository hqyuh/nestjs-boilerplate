import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSession1793454096920 implements MigrationInterface {
  name = 'CreateUserSession1793454096920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_session" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "user_id" uuid NOT NULL,
        "refresh_jti" character varying NOT NULL,
        "access_jti" character varying NOT NULL,
        "device_name" character varying(255),
        "expires_at" TIMESTAMP NOT NULL,
        "revoked_at" TIMESTAMP,
        CONSTRAINT "PK_user_session" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_user_session_user_id" ON "user_session" ("user_id")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_session_refresh_jti" ON "user_session" ("refresh_jti")`);
    await queryRunner.query(`
      ALTER TABLE "user_session"
      ADD CONSTRAINT "FK_user_session_user_id"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_session" DROP CONSTRAINT "FK_user_session_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_user_session_refresh_jti"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_session_user_id"`);
    await queryRunner.query(`DROP TABLE "user_session"`);
  }
}
