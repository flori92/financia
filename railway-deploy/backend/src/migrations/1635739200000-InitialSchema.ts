import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1635739200000 implements MigrationInterface {
    name = 'InitialSchema1635739200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table des connexions bancaires
        await queryRunner.query(`
            CREATE TABLE "bank_connections" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "bankCode" character varying NOT NULL,
                "status" character varying NOT NULL,
                "metadata" jsonb,
                "accessToken" character varying,
                "refreshToken" character varying,
                "tokenExpiresAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_bank_connections" PRIMARY KEY ("id")
            )
        `);

        // Table des comptes bancaires
        await queryRunner.query(`
            CREATE TABLE "bank_accounts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "connectionId" uuid NOT NULL,
                "externalId" character varying NOT NULL,
                "name" character varying NOT NULL,
                "type" character varying NOT NULL,
                "currency" character varying NOT NULL,
                "balance" decimal(15,2) NOT NULL DEFAULT 0,
                "iban" character varying,
                "bic" character varying,
                "status" character varying NOT NULL,
                "lastSyncAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_bank_accounts" PRIMARY KEY ("id"),
                CONSTRAINT "fk_bank_accounts_connection" FOREIGN KEY ("connectionId") 
                    REFERENCES "bank_connections"("id") ON DELETE CASCADE
            )
        `);

        // Table des transactions bancaires
        await queryRunner.query(`
            CREATE TABLE "bank_transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "accountId" uuid NOT NULL,
                "externalId" character varying NOT NULL,
                "date" TIMESTAMP NOT NULL,
                "amount" decimal(15,2) NOT NULL,
                "currency" character varying NOT NULL,
                "description" character varying NOT NULL,
                "type" character varying NOT NULL,
                "category" character varying,
                "status" character varying NOT NULL,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_bank_transactions" PRIMARY KEY ("id"),
                CONSTRAINT "fk_bank_transactions_account" FOREIGN KEY ("accountId") 
                    REFERENCES "bank_accounts"("id") ON DELETE CASCADE
            )
        `);

        // Table des anomalies
        await queryRunner.query(`
            CREATE TABLE "bank_anomalies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "transactionId" uuid NOT NULL,
                "accountId" uuid NOT NULL,
                "type" character varying NOT NULL,
                "score" decimal(5,4) NOT NULL,
                "status" character varying NOT NULL,
                "metadata" jsonb NOT NULL,
                "reviewedBy" character varying,
                "reviewedAt" TIMESTAMP,
                "resolution" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_bank_anomalies" PRIMARY KEY ("id"),
                CONSTRAINT "fk_bank_anomalies_transaction" FOREIGN KEY ("transactionId") 
                    REFERENCES "bank_transactions"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_bank_anomalies_account" FOREIGN KEY ("accountId") 
                    REFERENCES "bank_accounts"("id") ON DELETE CASCADE
            )
        `);

        // Table des notifications
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying NOT NULL,
                "type" character varying NOT NULL,
                "channel" character varying NOT NULL,
                "priority" character varying NOT NULL,
                "status" character varying NOT NULL,
                "data" jsonb NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "readAt" TIMESTAMP,
                CONSTRAINT "pk_notifications" PRIMARY KEY ("id")
            )
        `);

        // Index pour les recherches courantes
        await queryRunner.query(`
            CREATE INDEX "idx_bank_connections_user" ON "bank_connections"("userId");
            CREATE INDEX "idx_bank_accounts_connection" ON "bank_accounts"("connectionId");
            CREATE INDEX "idx_bank_transactions_account" ON "bank_transactions"("accountId");
            CREATE INDEX "idx_bank_transactions_date" ON "bank_transactions"("date");
            CREATE INDEX "idx_bank_anomalies_account" ON "bank_anomalies"("accountId");
            CREATE INDEX "idx_notifications_user" ON "notifications"("userId");
            CREATE INDEX "idx_notifications_status" ON "notifications"("status");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_notifications_status"`);
        await queryRunner.query(`DROP INDEX "idx_notifications_user"`);
        await queryRunner.query(`DROP INDEX "idx_bank_anomalies_account"`);
        await queryRunner.query(`DROP INDEX "idx_bank_transactions_date"`);
        await queryRunner.query(`DROP INDEX "idx_bank_transactions_account"`);
        await queryRunner.query(`DROP INDEX "idx_bank_accounts_connection"`);
        await queryRunner.query(`DROP INDEX "idx_bank_connections_user"`);

        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "bank_anomalies"`);
        await queryRunner.query(`DROP TABLE "bank_transactions"`);
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
        await queryRunner.query(`DROP TABLE "bank_connections"`);
    }
}