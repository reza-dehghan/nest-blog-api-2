import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaOwner1791963279249 implements MigrationInterface {
    name = 'AddMediaOwner1791963279249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" ADD "ownerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_138d7762e76b7fee9de6db0f8eb" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_138d7762e76b7fee9de6db0f8eb"`);
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "ownerId"`);
    }

}
