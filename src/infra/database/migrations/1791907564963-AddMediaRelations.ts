import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaRelations1791907564963 implements MigrationInterface {
    name = 'AddMediaRelations1791907564963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" RENAME COLUMN "avatar" TO "avatarMediaId"`);
        await queryRunner.query(`ALTER TABLE "media" ADD "postId" integer`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "avatarMediaId"`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "avatarMediaId" integer`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "UQ_e9245f1133da8f3900bbd9629c0" UNIQUE ("avatarMediaId")`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_9dcde1b1308b5f22f34b8454e28" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_e9245f1133da8f3900bbd9629c0" FOREIGN KEY ("avatarMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_e9245f1133da8f3900bbd9629c0"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_9dcde1b1308b5f22f34b8454e28"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "UQ_e9245f1133da8f3900bbd9629c0"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "avatarMediaId"`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "avatarMediaId" character varying`);
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "postId"`);
        await queryRunner.query(`ALTER TABLE "profile" RENAME COLUMN "avatarMediaId" TO "avatar"`);
    }

}
