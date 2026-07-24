import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArticleUnitsAndTimeEntryRework1715683400000
  implements MigrationInterface
{
  name = 'ArticleUnitsAndTimeEntryRework1715683400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "article_units" (
        "articleId" uuid NOT NULL,
        "unitId" uuid NOT NULL,
        CONSTRAINT "PK_article_units" PRIMARY KEY ("articleId", "unitId")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_article_units_unitId" ON "article_units" ("unitId")`,
    );
    await queryRunner.query(`
      ALTER TABLE "article_units"
      ADD CONSTRAINT "FK_article_units_article"
      FOREIGN KEY ("articleId") REFERENCES "articles"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "article_units"
      ADD CONSTRAINT "FK_article_units_unit"
      FOREIGN KEY ("unitId") REFERENCES "units"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "units"
      ADD COLUMN "isHourUnit" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD COLUMN "date" date
    `);
    await queryRunner.query(`
      UPDATE "time_entries" SET "date" = "startAt"::date
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ALTER COLUMN "date" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ALTER COLUMN "startAt" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ALTER COLUMN "endAt" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      DROP COLUMN "durationMinutes"
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      DROP COLUMN "employeeMinutes"
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD CONSTRAINT "CHK_time_entries_endAt_gte_startAt"
      CHECK ("startAt" IS NULL OR "endAt" IS NULL OR "endAt" >= "startAt")
    `);
    await queryRunner.query(
      `DROP INDEX "IDX_time_entries_etaId_startAt"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entries_etaId_date" ON "time_entries" ("etaId", "date")`,
    );

    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ADD COLUMN "unitId" uuid
    `);
    await queryRunner.query(`
      UPDATE "time_entry_quantities" q
      SET "unitId" = t."unitId"
      FROM "tariffs" t
      WHERE t."id" = q."tariffId"
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ALTER COLUMN "unitId" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ADD CONSTRAINT "FK_time_entry_quantities_unit"
      FOREIGN KEY ("unitId") REFERENCES "units"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      DROP CONSTRAINT "FK_time_entry_quantities_tariff"
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ALTER COLUMN "tariffId" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ADD CONSTRAINT "FK_time_entry_quantities_tariff"
      FOREIGN KEY ("tariffId") REFERENCES "tariffs"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      DROP CONSTRAINT "FK_time_entry_quantities_tariff"
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ALTER COLUMN "tariffId" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      ADD CONSTRAINT "FK_time_entry_quantities_tariff"
      FOREIGN KEY ("tariffId") REFERENCES "tariffs"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      DROP CONSTRAINT "FK_time_entry_quantities_unit"
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entry_quantities"
      DROP COLUMN "unitId"
    `);

    await queryRunner.query(
      `DROP INDEX "IDX_time_entries_etaId_date"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_time_entries_etaId_startAt" ON "time_entries" ("etaId", "startAt")`,
    );
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      DROP CONSTRAINT "CHK_time_entries_endAt_gte_startAt"
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD COLUMN "employeeMinutes" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ADD COLUMN "durationMinutes" integer
    `);
    await queryRunner.query(`
      UPDATE "time_entries"
      SET "durationMinutes" = GREATEST(
        ROUND(EXTRACT(EPOCH FROM ("endAt" - "startAt")) / 60)::integer,
        0
      )
      WHERE "startAt" IS NOT NULL AND "endAt" IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "time_entries" SET "durationMinutes" = 0 WHERE "durationMinutes" IS NULL
    `);
    await queryRunner.query(`
      UPDATE "time_entries" SET "employeeMinutes" = "durationMinutes" WHERE "employeeMinutes" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ALTER COLUMN "durationMinutes" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ALTER COLUMN "employeeMinutes" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ALTER COLUMN "startAt" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      ALTER COLUMN "endAt" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "time_entries"
      DROP COLUMN "date"
    `);

    await queryRunner.query(`
      ALTER TABLE "units"
      DROP COLUMN "isHourUnit"
    `);

    await queryRunner.query(`DROP TABLE "article_units"`);
  }
}
