CREATE TYPE "user_role" AS ENUM (
  'USER',
  'ADMIN'
);

CREATE TYPE "oauth_provider" AS ENUM (
  'GOOGLE',
  'FACEBOOK',
  'TIKTOK',
  'APPLE'
);

CREATE TABLE "permission" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar NOT NULL,
  "description" varchar NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "role" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar NOT NULL,
  "description" varchar NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "role_permissions_permission" (
  "role_id" uuid NOT NULL,
  "permission_id" uuid NOT NULL,
  PRIMARY KEY ("role_id", "permission_id")
);

CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" varchar UNIQUE NOT NULL,
  "first_name" varchar,
  "middle_name" varchar,
  "last_name" varchar,
  "phone_number" varchar,
  "avatar_url" text,
  "email_verified_at" timestamp,
  "role" user_role DEFAULT 'USER',
  "role_id" integer,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "oauth_account" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "provider" oauth_provider NOT NULL,
  "provider_account_id" varchar NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "expires_at" timestamp,
  "token_type" varchar,
  "scope" text,
  "id_token" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE INDEX ON "permission" ("name");

CREATE INDEX ON "role" ("name");

CREATE INDEX ON "role_permissions_permission" ("role_id");

CREATE INDEX ON "role_permissions_permission" ("permission_id");

CREATE INDEX ON "user" ("email");

CREATE INDEX ON "user" ("role");

CREATE INDEX ON "user" ("role_id");

CREATE INDEX ON "oauth_account" ("user_id");

CREATE UNIQUE INDEX ON "oauth_account" ("provider", "provider_account_id");

ALTER TABLE "oauth_account" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("role_id") REFERENCES "role" ("id");

ALTER TABLE "role_permissions_permission" ADD FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions_permission" ADD FOREIGN KEY ("permission_id") REFERENCES "permission" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
