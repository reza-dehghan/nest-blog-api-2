import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostViewEvents1792223368453 implements MigrationInterface {
    name = 'CreatePostViewEvents1792223368453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_view_event" ("id" SERIAL NOT NULL, "postId" integer NOT NULL, "userId" integer, "visitorId" character varying(64), "viewDate" date NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_post_view_event_exactly_one_identity" CHECK ((("userId" IS NOT NULL AND "visitorId" IS NULL) OR ("userId" IS NULL AND "visitorId" IS NOT NULL))), CONSTRAINT "PK_692a2f6acc73ffa1052cfdd4e23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_post_view_event_visitor_daily_unique" ON "post_view_event"  ("postId", "visitorId", "viewDate") WHERE "visitorId" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_post_view_event_user_daily_unique" ON "post_view_event"  ("postId", "userId", "viewDate") WHERE "userId" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_view_event" ADD CONSTRAINT "FK_02ca6b1fcebaa9fa8a5796d89e5" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_view_event" ADD CONSTRAINT "FK_1f3aee662de9613c823451d0ed0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_view_event" DROP CONSTRAINT "FK_1f3aee662de9613c823451d0ed0"`);
        await queryRunner.query(`ALTER TABLE "post_view_event" DROP CONSTRAINT "FK_02ca6b1fcebaa9fa8a5796d89e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_view_event_user_daily_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_view_event_visitor_daily_unique"`);
        await queryRunner.query(`DROP TABLE "post_view_event"`);
    }

}
