import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRefreshtokenCascade1753202545636 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`,
        )
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO
            ACTION`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`,
        )
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION CASCADE ON UPDATE NO
            ACTION`,
        )
    }
}
