
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockContentByteLimit1791895517780 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "block"
            ADD CONSTRAINT "CHK_block_content_max_1024_bytes"
            CHECK (octet_length("content") <= 1024)
        `);

        await queryRunner.query(`
            ALTER TABLE "block"
            ADD CONSTRAINT "CHK_block_content_not_empty"
            CHECK (length(trim("content")) > 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "block"
            DROP CONSTRAINT "CHK_block_content_not_empty"
        `);

        await queryRunner.query(`
            ALTER TABLE "block"
            DROP CONSTRAINT "CHK_block_content_max_1024_bytes"
        `);
    }
}
