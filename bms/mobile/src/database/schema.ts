import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    // Utilisateurs
    tableSchema({
      name: 'users',
      columns: [
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'role', type: 'string' },
        { name: 'ux_level', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Entreprises
    tableSchema({
      name: 'companies',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'legal_name', type: 'string', isOptional: true },
        { name: 'tax_id', type: 'string', isOptional: true },
        { name: 'currency', type: 'string' },
        { name: 'plan', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Factures
    tableSchema({
      name: 'invoices',
      columns: [
        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'invoice_number', type: 'string', isIndexed: true },
        { name: 'invoice_type', type: 'string' },
        { name: 'invoice_date', type: 'number' },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'party_name', type: 'string' },
        { name: 'party_phone', type: 'string', isOptional: true },
        { name: 'total_amount', type: 'number' },
        { name: 'paid_amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'payment_method', type: 'string', isOptional: true },
        { name: 'mobile_money_provider', type: 'string', isOptional: true },
        { name: 'qr_code_data', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Lignes de facture
    tableSchema({
      name: 'invoice_items',
      columns: [
        { name: 'invoice_id', type: 'string', isIndexed: true },
        { name: 'item_name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'quantity', type: 'number' },
        { name: 'unit_price', type: 'number' },
        { name: 'line_total', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // Paiements
    tableSchema({
      name: 'payments',
      columns: [
        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'payment_number', type: 'string', isIndexed: true },
        { name: 'payment_type', type: 'string' },
        { name: 'payment_date', type: 'number' },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'payment_method', type: 'string' },
        { name: 'mobile_money_provider', type: 'string', isOptional: true },
        { name: 'mobile_money_phone', type: 'string', isOptional: true },
        { name: 'transaction_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Comptes Mobile Money
    tableSchema({
      name: 'mobile_money_accounts',
      columns: [
        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'provider', type: 'string' },
        { name: 'account_name', type: 'string' },
        { name: 'phone_number', type: 'string', isIndexed: true },
        { name: 'balance', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'is_active', type: 'boolean' },
        { name: 'is_default', type: 'boolean' },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Logs de synchronisation
    tableSchema({
      name: 'sync_logs',
      columns: [
        { name: 'sync_type', type: 'string' },
        { name: 'entity_type', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'changes_count', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
