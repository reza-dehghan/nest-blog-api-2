
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePostViewEventForAuthenticatedUsers1781600000000
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Guest events cannot be associated with a real user.
        await queryRunner.query(`
            DELETE FROM "post_view_event"
            WHERE "userId" IS NULL
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS
            "IDX_post_view_event_visitor_daily_unique"
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS
            "IDX_post_view_event_user_daily_unique"
        `);

        await queryRunner.query(`
            ALTER TABLE "post_view_event"
            DROP CONSTRAINT IF EXISTS
            "CHK_post_view_event_exactly_one_identity"
        `);

        await queryRunner.query(`
            ALTER TABLE "post_view_event"
            DROP COLUMN IF EXISTS "visitorId"
        `);

        await queryRunner.query(`
            ALTER TABLE "post_view_event"
            ALTER COLUMN "userId" SET NOT NULL
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX
            "IDX_post_view_event_user_daily_unique"
            ON "post_view_event" ("postId", "userId", "viewDate")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS
            "IDX_post_view_event_user_daily_unique"
        `);

        await queryRunner.query(`
            ALTER TABLE "post_view_event"
            ADD COLUMN "visitorId" character varying(64)
        `);

        await queryRunner.query(`
            ALTER TABLE "post_view_event"
            ALTER COLUMN "userId" DROP NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "post_view_event"
            ADD CONSTRAINT "CHK_post_view_event_exactly_one_identity"
            CHECK (
                (
                    "userId" IS NOT NULL
                    AND "visitorId" IS NULL
                )
                OR
                (
                    "userId" IS NULL
                    AND "visitorId" IS NOT NULL
                )
            )
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX
            "IDX_post_view_event_user_daily_unique"
            ON "post_view_event" ("postId", "userId", "viewDate")
            WHERE "userId" IS NOT NULL
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX
            "IDX_post_view_event_visitor_daily_unique"
            ON "post_view_event" ("postId", "visitorId", "viewDate")
            WHERE "visitorId" IS NOT NULL
        `);
    }
}
