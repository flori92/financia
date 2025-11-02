import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationConfigsTable1732000000000 implements MigrationInterface {
  name = 'CreateNotificationConfigsTable1732000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notification_configs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "companyId" uuid NOT NULL,
        "emailProvider" character varying,
        "smtpHost" character varying,
        "smtpPort" integer,
        "smtpSecure" boolean DEFAULT false,
        "smtpUser" character varying,
        "smtpPass" character varying,
        "smtpFrom" character varying,
        "sendgridApiKey" character varying,
        "sendgridFrom" character varying,
        "smsProvider" character varying,
        "twilioAccountSid" character varying,
        "twilioAuthToken" character varying,
        "twilioPhoneNumber" character varying,
        "whatsappProvider" character varying,
        "twilioWhatsAppNumber" character varying,
        "metaAccessToken" character varying,
        "metaPhoneNumberId" character varying,
        "frontendUrl" character varying,
        "enabled" boolean DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_configs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notification_configs_companyId" ON "notification_configs" ("companyId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "notification_configs"
    `);
  }
}
