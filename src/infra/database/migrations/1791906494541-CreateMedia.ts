import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMedia1791906494541 implements MigrationInterface {
    name = 'CreateMedia1791906494541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "CHK_block_content_max_1024_bytes"`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "CHK_block_content_not_empty"`);
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "storageKey" character varying(500) NOT NULL, "originalName" character varying(255) NOT NULL, "contentType" character varying(100) NOT NULL, "size" bigint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b610a22e5ce5597e88a8d9c9b2a" UNIQUE ("storageKey"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "CHK_block_content_not_empty" CHECK ((length(TRIM(BOTH FROM content)) > 0))`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "CHK_block_content_max_1024_bytes" CHECK ((octet_length((content)::text) <= 1024))`);
    }

}
