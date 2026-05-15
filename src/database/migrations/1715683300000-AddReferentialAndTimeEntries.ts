import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferentialAndTimeEntries1715683300000 implements MigrationInterface {
  name = 'AddReferentialAndTimeEntries1715683300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."article_type_enum" AS ENUM(
        'billable',
        'client_service',
        'general_work',
        'absence',
        'maintenance',
        'travel',
        'consumable'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "code" character varying(64),
        "displayName" character varying(255) NOT NULL,
        "contactName" character varying(255),
        "email" character varying(255),
        "phone" character varying(64),
        "notes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_clients_etaId_code" UNIQUE ("etaId", "code"),
        CONSTRAINT "PK_clients_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "userId" uuid,
        "code" character varying(64),
        "firstName" character varying(255) NOT NULL,
        "lastName" character varying(255) NOT NULL,
        "email" character varying(255),
        "phone" character varying(64),
        "dailyMinutes" integer NOT NULL DEFAULT 420,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_employees_etaId_code" UNIQUE ("etaId", "code"),
        CONSTRAINT "UQ_employees_etaId_userId" UNIQUE ("etaId", "userId"),
        CONSTRAINT "PK_employees_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "materials" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "code" character varying(64),
        "name" character varying(255) NOT NULL,
        "registrationNumber" character varying(128),
        "analyticCode" character varying(128),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_materials_etaId_code" UNIQUE ("etaId", "code"),
        CONSTRAINT "PK_materials_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "code" character varying(64) NOT NULL,
        "name" character varying(255) NOT NULL,
        "type" "public"."article_type_enum" NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_articles_etaId_code" UNIQUE ("etaId", "code"),
        CONSTRAINT "PK_articles_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "units" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "code" character varying(32) NOT NULL,
        "label" character varying(128) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_units_etaId_code" UNIQUE ("etaId", "code"),
        CONSTRAINT "PK_units_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tariff_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "name" character varying(128) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tariff_categories_etaId_name" UNIQUE ("etaId", "name"),
        CONSTRAINT "PK_tariff_categories_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tariffs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "articleId" uuid NOT NULL,
        "unitId" uuid NOT NULL,
        "categoryId" uuid,
        "label" character varying(255) NOT NULL,
        "unitPrice" numeric(12,4),
        "validFrom" date,
        "validTo" date,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tariffs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "time_entries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "etaId" uuid NOT NULL,
        "clientId" uuid,
        "employeeId" uuid NOT NULL,
        "articleId" uuid NOT NULL,
        "createdByUserId" uuid NOT NULL,
        "startAt" TIMESTAMPTZ NOT NULL,
        "endAt" TIMESTAMPTZ NOT NULL,
        "durationMinutes" integer NOT NULL,
        "employeeMinutes" integer NOT NULL,
        "comment" text,
        "personalKm" numeric(10,2) NOT NULL DEFAULT 0,
        "personalAmount" numeric(10,2) NOT NULL DEFAULT 0,
        "halfDay" boolean NOT NULL DEFAULT false,
        "validatedAt" TIMESTAMPTZ,
        "validatedByUserId" uuid,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_time_entries_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "time_entry_materials" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "timeEntryId" uuid NOT NULL,
        "materialId" uuid NOT NULL,
        "meterStart" numeric(12,2),
        "meterEnd" numeric(12,2),
        CONSTRAINT "PK_time_entry_materials_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "time_entry_quantities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "timeEntryId" uuid NOT NULL,
        "tariffId" uuid NOT NULL,
        "quantity" numeric(12,3) NOT NULL,
        CONSTRAINT "PK_time_entry_quantities_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "time_entry_consumables" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "timeEntryId" uuid NOT NULL,
        "materialId" uuid,
        "articleId" uuid NOT NULL,
        "tariffId" uuid,
        "quantity" numeric(12,3) NOT NULL,
        "meterStart" numeric(12,2),
        "meterEnd" numeric(12,2),
        CONSTRAINT "PK_time_entry_consumables_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_clients_etaId" ON "clients" ("etaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_employees_etaId" ON "employees" ("etaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_materials_etaId" ON "materials" ("etaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_etaId" ON "articles" ("etaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_units_etaId" ON "units" ("etaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tariff_categories_etaId" ON "tariff_categories" ("etaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tariffs_etaId" ON "tariffs" ("etaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entries_etaId_startAt" ON "time_entries" ("etaId", "startAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entries_etaId_employeeId" ON "time_entries" ("etaId", "employeeId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entry_materials_timeEntryId" ON "time_entry_materials" ("timeEntryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entry_materials_materialId" ON "time_entry_materials" ("materialId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entry_quantities_timeEntryId" ON "time_entry_quantities" ("timeEntryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entry_consumables_timeEntryId" ON "time_entry_consumables" ("timeEntryId")`,
    );

    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD CONSTRAINT "FK_clients_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "employees"
      ADD CONSTRAINT "FK_employees_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "employees"
      ADD CONSTRAINT "FK_employees_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "materials"
      ADD CONSTRAINT "FK_materials_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "FK_articles_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "units"
      ADD CONSTRAINT "FK_units_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "tariff_categories"
      ADD CONSTRAINT "FK_tariff_categories_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "tariffs"
      ADD CONSTRAINT "FK_tariffs_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "tariffs"
      ADD CONSTRAINT "FK_tariffs_article"
      FOREIGN KEY ("articleId") REFERENCES "articles"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "tariffs"
      ADD CONSTRAINT "FK_tariffs_unit"
      FOREIGN KEY ("unitId") REFERENCES "units"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "tariffs"
      ADD CONSTRAINT "FK_tariffs_category"
      FOREIGN KEY ("categoryId") REFERENCES "tariff_categories"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD CONSTRAINT "FK_time_entries_eta"
      FOREIGN KEY ("etaId") REFERENCES "etas"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD CONSTRAINT "FK_time_entries_client"
      FOREIGN KEY ("clientId") REFERENCES "clients"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD CONSTRAINT "FK_time_entries_employee"
      FOREIGN KEY ("employeeId") REFERENCES "employees"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD CONSTRAINT "FK_time_entries_article"
      FOREIGN KEY ("articleId") REFERENCES "articles"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD CONSTRAINT "FK_time_entries_created_by_user"
      FOREIGN KEY ("createdByUserId") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD CONSTRAINT "FK_time_entries_validated_by_user"
      FOREIGN KEY ("validatedByUserId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_materials"
      ADD CONSTRAINT "FK_time_entry_materials_time_entry"
      FOREIGN KEY ("timeEntryId") REFERENCES "time_entries"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_materials"
      ADD CONSTRAINT "FK_time_entry_materials_material"
      FOREIGN KEY ("materialId") REFERENCES "materials"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ADD CONSTRAINT "FK_time_entry_quantities_time_entry"
      FOREIGN KEY ("timeEntryId") REFERENCES "time_entries"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ADD CONSTRAINT "FK_time_entry_quantities_tariff"
      FOREIGN KEY ("tariffId") REFERENCES "tariffs"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_consumables"
      ADD CONSTRAINT "FK_time_entry_consumables_time_entry"
      FOREIGN KEY ("timeEntryId") REFERENCES "time_entries"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_consumables"
      ADD CONSTRAINT "FK_time_entry_consumables_material"
      FOREIGN KEY ("materialId") REFERENCES "materials"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_consumables"
      ADD CONSTRAINT "FK_time_entry_consumables_article"
      FOREIGN KEY ("articleId") REFERENCES "articles"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_consumables"
      ADD CONSTRAINT "FK_time_entry_consumables_tariff"
      FOREIGN KEY ("tariffId") REFERENCES "tariffs"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      INSERT INTO "clients" ("id", "etaId", "code", "displayName", "contactName", "email", "phone")
      VALUES (
        '00000000-0000-0000-0000-000000001001',
        '00000000-0000-0000-0000-000000000001',
        'CLI-DEMO',
        'Client Demo',
        'Contact Demo',
        'client@eta.local',
        '0102030405'
      )
    `);
    await queryRunner.query(`
      INSERT INTO "employees" ("id", "etaId", "userId", "code", "firstName", "lastName", "email")
      VALUES (
        '00000000-0000-0000-0000-000000002001',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000010',
        'SAL-DEMO',
        'Admin',
        'ETA',
        'admin@eta.local'
      )
    `);
    await queryRunner.query(`
      INSERT INTO "materials" ("id", "etaId", "code", "name", "registrationNumber", "analyticCode")
      VALUES (
        '00000000-0000-0000-0000-000000003001',
        '00000000-0000-0000-0000-000000000001',
        'MAT-DEMO',
        'Tracteur demo',
        'ETA-001',
        'TRACTEUR'
      )
    `);
    await queryRunner.query(`
      INSERT INTO "units" ("id", "etaId", "code", "label")
      VALUES
      ('00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000000001', 'H', 'Heure'),
      ('00000000-0000-0000-0000-000000004002', '00000000-0000-0000-0000-000000000001', 'HA', 'Hectare'),
      ('00000000-0000-0000-0000-000000004003', '00000000-0000-0000-0000-000000000001', 'L', 'Litre')
    `);
    await queryRunner.query(`
      INSERT INTO "tariff_categories" ("id", "etaId", "name")
      VALUES (
        '00000000-0000-0000-0000-000000005001',
        '00000000-0000-0000-0000-000000000001',
        'Standard'
      )
    `);
    await queryRunner.query(`
      INSERT INTO "articles" ("id", "etaId", "code", "name", "type")
      VALUES
      ('00000000-0000-0000-0000-000000006001', '00000000-0000-0000-0000-000000000001', 'ETA-TRAV', 'Travail facturable', 'billable'),
      ('00000000-0000-0000-0000-000000006002', '00000000-0000-0000-0000-000000000001', 'ETA-ENT', 'Entretien', 'maintenance'),
      ('00000000-0000-0000-0000-000000006003', '00000000-0000-0000-0000-000000000001', 'ETA-ABS', 'Absence', 'absence'),
      ('00000000-0000-0000-0000-000000006004', '00000000-0000-0000-0000-000000000001', 'ETA-DEP', 'Deplacement', 'travel'),
      ('00000000-0000-0000-0000-000000006005', '00000000-0000-0000-0000-000000000001', 'ETA-GNR', 'GNR', 'consumable')
    `);
    await queryRunner.query(`
      INSERT INTO "tariffs" ("id", "etaId", "articleId", "unitId", "categoryId", "label", "unitPrice")
      VALUES
      ('00000000-0000-0000-0000-000000007001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000006001', '00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000005001', 'Travail horaire standard', 75),
      ('00000000-0000-0000-0000-000000007002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000006005', '00000000-0000-0000-0000-000000004003', '00000000-0000-0000-0000-000000005001', 'GNR au litre', 1.5)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "time_entry_consumables"`);
    await queryRunner.query(`DROP TABLE "time_entry_quantities"`);
    await queryRunner.query(`DROP TABLE "time_entry_materials"`);
    await queryRunner.query(`DROP TABLE "time_entries"`);
    await queryRunner.query(`DROP TABLE "tariffs"`);
    await queryRunner.query(`DROP TABLE "tariff_categories"`);
    await queryRunner.query(`DROP TABLE "units"`);
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(`DROP TABLE "materials"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TYPE "public"."article_type_enum"`);
  }
}
