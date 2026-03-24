import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabaseSchema1774367726671 implements MigrationInterface {
  name = 'CreateDatabaseSchema1774367726671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."oauth_account_provider_enum" AS ENUM('GOOGLE', 'FACEBOOK', 'TIKTOK', 'APPLE')`
    );
    await queryRunner.query(
      `CREATE TABLE "oauth_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "updated_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "provider" "public"."oauth_account_provider_enum" NOT NULL, "provider_account_id" character varying NOT NULL, "access_token" text, "refresh_token" text, "expires_at" TIMESTAMP, "token_type" character varying, "scope" text, "id_token" text, CONSTRAINT "PK_01ec7d2a8273dcaaed3dd10a4fb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3dd11f6bfdc5ebe96667baa4b9" ON "oauth_account" ("provider", "provider_account_id") `
    );
    await queryRunner.query(`CREATE INDEX "IDX_e355ddb0b69b083cbf253345d1" ON "oauth_account" ("user_id") `);
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "updated_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "updated_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "updated_at" TIMESTAMP NOT NULL DEFAULT '"2026-03-24T15:55:27.620Z"', "deleted_at" TIMESTAMP, "email" character varying NOT NULL, "first_name" character varying, "middle_name" character varying, "last_name" character varying, "password" text, "phone_number" character varying, "avatar_url" character varying, "email_verified_at" TIMESTAMP, "role_id" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_7a4fd2a547828e5efe420e50d1" ON "user" ("first_name") `);
    await queryRunner.query(`CREATE INDEX "IDX_6937e802be2946855a3ad0e6be" ON "user" ("last_name") `);
    await queryRunner.query(
      `CREATE TABLE "role_permissions_permission" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_32d63c82505b0b1d565761ae201" PRIMARY KEY ("role_id", "permission_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0167acb6e0ccfcf0c6c140cec4" ON "role_permissions_permission" ("role_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d3e8e7c82bdee8553b6f1e332" ON "role_permissions_permission" ("permission_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_account" ADD CONSTRAINT "FK_e355ddb0b69b083cbf253345d1c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_0167acb6e0ccfcf0c6c140cec4a" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_2d3e8e7c82bdee8553b6f1e3325" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_2d3e8e7c82bdee8553b6f1e3325"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_0167acb6e0ccfcf0c6c140cec4a"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
    await queryRunner.query(`ALTER TABLE "oauth_account" DROP CONSTRAINT "FK_e355ddb0b69b083cbf253345d1c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2d3e8e7c82bdee8553b6f1e332"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0167acb6e0ccfcf0c6c140cec4"`);
    await queryRunner.query(`DROP TABLE "role_permissions_permission"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6937e802be2946855a3ad0e6be"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7a4fd2a547828e5efe420e50d1"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e355ddb0b69b083cbf253345d1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3dd11f6bfdc5ebe96667baa4b9"`);
    await queryRunner.query(`DROP TABLE "oauth_account"`);
    await queryRunner.query(`DROP TYPE "public"."oauth_account_provider_enum"`);
  }
}
