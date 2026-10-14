import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAndProfile1791619969886 implements MigrationInterface {
    name = 'UpdateUserAndProfile1791619969886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "displayName" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "displayName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "firstName" character varying NOT NULL`);
    }

}
