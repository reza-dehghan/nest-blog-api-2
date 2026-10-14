import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockTypeAndMedia1791965627875 implements MigrationInterface {
    name = 'AddBlockTypeAndMedia1791965627875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."block_type_enum" AS ENUM('text', 'image')`);
        await queryRunner.query(`ALTER TABLE "block" ADD "type" "public"."block_type_enum" NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "block" ADD "mediaId" integer`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_0b5bd6a2748c205c503af282457" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_0b5bd6a2748c205c503af282457"`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "mediaId"`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."block_type_enum"`);
    }

}
