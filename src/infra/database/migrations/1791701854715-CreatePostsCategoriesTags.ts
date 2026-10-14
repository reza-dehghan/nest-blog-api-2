import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostsCategoriesTags1791701854715 implements MigrationInterface {
    name = 'CreatePostsCategoriesTags1791701854715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(150) NOT NULL, "description" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(150) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3413aed3ecde54f832c4f44f045" UNIQUE ("slug"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "slug" character varying(250) NOT NULL, "excerpt" text, "isPublished" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP WITH TIME ZONE, "authorId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_cd1bddce36edc3e766798eab376" UNIQUE ("slug"), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_categories" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "PK_b8b835d4ca757299cd0d36804c0" PRIMARY KEY ("postId", "categoryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d9837aecaf223e3cadb55fed67" ON "post_categories"  ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9bd6598aa52c1550ed7707a71b" ON "post_categories"  ("categoryId") `);
        await queryRunner.query(`CREATE TABLE "post_tags" ("postId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_ba869415ada9d211d8af980499f" PRIMARY KEY ("postId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_76e701b89d9bba541e1543adfa" ON "post_tags"  ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86fabcae8483f7cc4fbd36cf6a" ON "post_tags"  ("tagId") `);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_d9837aecaf223e3cadb55fed677" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_76e701b89d9bba541e1543adfac" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_86fabcae8483f7cc4fbd36cf6a2" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_86fabcae8483f7cc4fbd36cf6a2"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_76e701b89d9bba541e1543adfac"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_d9837aecaf223e3cadb55fed677"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86fabcae8483f7cc4fbd36cf6a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_76e701b89d9bba541e1543adfa"`);
        await queryRunner.query(`DROP TABLE "post_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bd6598aa52c1550ed7707a71b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d9837aecaf223e3cadb55fed67"`);
        await queryRunner.query(`DROP TABLE "post_categories"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
