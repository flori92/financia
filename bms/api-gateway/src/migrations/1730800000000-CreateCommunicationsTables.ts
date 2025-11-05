import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCommunicationsTables1730800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Emails table
    await queryRunner.createTable(
      new Table({
        name: 'emails',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'from',
            type: 'varchar',
          },
          {
            name: 'to',
            type: 'varchar',
          },
          {
            name: 'cc',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bcc',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'subject',
            type: 'varchar',
          },
          {
            name: 'body',
            type: 'text',
          },
          {
            name: 'folder',
            type: 'varchar',
            default: "'inbox'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'draft'",
          },
          {
            name: 'read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'starred',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_attachment',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'delivered_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'emails',
      new TableIndex({
        name: 'IDX_EMAILS_COMPANY_FOLDER',
        columnNames: ['company_id', 'folder'],
      }),
    );

    await queryRunner.createIndex(
      'emails',
      new TableIndex({
        name: 'IDX_EMAILS_COMPANY_CREATED',
        columnNames: ['company_id', 'created_at'],
      }),
    );

    // SMS Messages table
    await queryRunner.createTable(
      new Table({
        name: 'sms_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'to',
            type: 'varchar',
          },
          {
            name: 'from',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'provider_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'provider_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'delivered_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'sms_messages',
      new TableIndex({
        name: 'IDX_SMS_COMPANY_CREATED',
        columnNames: ['company_id', 'created_at'],
      }),
    );

    // WhatsApp Messages table
    await queryRunner.createTable(
      new Table({
        name: 'whatsapp_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'conversation_id',
            type: 'varchar',
          },
          {
            name: 'to',
            type: 'varchar',
          },
          {
            name: 'from',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'type',
            type: 'varchar',
            default: "'text'",
          },
          {
            name: 'direction',
            type: 'varchar',
            default: "'outbound'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'media_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'provider_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'delivered_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'whatsapp_messages',
      new TableIndex({
        name: 'IDX_WHATSAPP_COMPANY_CONVERSATION',
        columnNames: ['company_id', 'conversation_id'],
      }),
    );

    await queryRunner.createIndex(
      'whatsapp_messages',
      new TableIndex({
        name: 'IDX_WHATSAPP_COMPANY_CREATED',
        columnNames: ['company_id', 'created_at'],
      }),
    );

    // Communication Templates table
    await queryRunner.createTable(
      new Table({
        name: 'communication_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'category',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'subject',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'body',
            type: 'text',
          },
          {
            name: 'variables',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'communication_templates',
      new TableIndex({
        name: 'IDX_TEMPLATES_COMPANY_TYPE',
        columnNames: ['company_id', 'type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('communication_templates');
    await queryRunner.dropTable('whatsapp_messages');
    await queryRunner.dropTable('sms_messages');
    await queryRunner.dropTable('emails');
  }
}
