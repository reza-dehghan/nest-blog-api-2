import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlocks1791874739334 implements MigrationInterface {
    name = 'CreateBlocks1791874739334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9"`);
        await queryRunner.query(`CREATE TABLE "block" ("id" SERIAL NOT NULL, "postId" integer NOT NULL, "content" character varying(1024) NOT NULL, "position" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8abd1df7d9a234cc17bc6b0def" ON "block"  ("postId", "position") `);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_ae2bfba9e3317f7af4ecc4a7767" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9"`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_ae2bfba9e3317f7af4ecc4a7767"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8abd1df7d9a234cc17bc6b0def"`);
        await queryRunner.query(`DROP TABLE "block"`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
