import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAuthAndEta1715683200000 implements MigrationInterface {
  name = 'InitAuthAndEta1715683200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TYPE "public"."eta_users_role_enum" AS ENUM(
        'owner',
        'admin',
        'employee',
        'material_manager',
        'client_contact'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "etas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_etas_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_etas_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "firstName" character varying(255),
        "lastName" character varying(255),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "eta_users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" "public"."eta_users_role_enum" NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_eta_users_etaId_userId" UNIQUE ("etaId", "userId"),
        CONSTRAINT "PK_eta_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "tokenHash" character varying(255) NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "revokedAt" TIMESTAMPTZ,
        "ipAddress" character varying(255),
        "userAgent" character varying(1000),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "eta_users"
      ADD CONSTRAINT "FK_eta_users_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "eta_users"
      ADD CONSTRAINT "FK_eta_users_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "FK_refresh_tokens_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eta_users_userId" ON "eta_users" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eta_users_etaId" ON "eta_users" ("etaId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")
    `);

    await queryRunner.query(`
      INSERT INTO "etas" ("id", "name", "slug", "isActive")
      VALUES ('00000000-0000-0000-0000-000000000001', 'ETA Demo', 'eta-demo', true)
    `);

    await queryRunner.query(`
      INSERT INTO "users" ("id", "email", "passwordHash", "firstName", "lastName", "isActive")
      VALUES (
        '00000000-0000-0000-0000-000000000010',
        'admin@eta.local',
        '$2b$10$I8PyoYJvxPqLadmAEST7q.Urx9mPvVIiLVOhMAkWIRChhiECKrFCa',
        'Admin',
        'ETA',
        true
      )
    `);

    await queryRunner.query(`
      INSERT INTO "eta_users" ("id", "etaId", "userId", "role", "isActive")
      VALUES (
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000010',
        'owner',
        true
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "eta_users" WHERE "id" = '00000000-0000-0000-0000-000000000020'`,
    );
    await queryRunner.query(
      `DELETE FROM "users" WHERE "id" = '00000000-0000-0000-0000-000000000010'`,
    );
    await queryRunner.query(
      `DELETE FROM "etas" WHERE "id" = '00000000-0000-0000-0000-000000000001'`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_eta_users_etaId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_eta_users_userId"`);

    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "eta_users" DROP CONSTRAINT "FK_eta_users_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "eta_users" DROP CONSTRAINT "FK_eta_users_eta"`,
    );

    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "eta_users"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "etas"`);
    await queryRunner.query(`DROP TYPE "public"."eta_users_role_enum"`);
  }
}
