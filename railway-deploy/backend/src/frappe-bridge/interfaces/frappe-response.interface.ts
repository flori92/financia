/**
 * Interfaces pour les réponses de l'API Frappe
 */

export interface FrappeAuthResponse {
  message: string;
  full_name: string;
  sid: string;
}

export interface FrappeDocResponse<T = any> {
  data: T;
}

export interface FrappeListResponse<T = any> {
  data: T[];
}

export interface FrappeAccount {
  name: string;
  account_name: string;
  account_number: string;
  account_type: string;
  root_type: string;
  parent_account?: string;
  is_group: number;
  company: string;
}

export interface FrappeJournalEntry {
  name: string;
  posting_date: string;
  accounts: FrappeJournalEntryAccount[];
  total_debit: number;
  total_credit: number;
  user_remark?: string;
  docstatus: number;
}

export interface FrappeJournalEntryAccount {
  account: string;
  debit_in_account_currency: number;
  credit_in_account_currency: number;
  reference_type?: string;
  reference_name?: string;
}

export interface FrappeInvoice {
  name: string;
  customer?: string;
  supplier?: string;
  posting_date: string;
  due_date: string;
  grand_total: number;
  outstanding_amount: number;
  status: string;
  items: FrappeInvoiceItem[];
}

export interface FrappeInvoiceItem {
  item_code: string;
  item_name: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface FrappePaymentEntry {
  name: string;
  payment_type: string;
  party_type: string;
  party: string;
  paid_amount: number;
  received_amount: number;
  mode_of_payment: string;
  reference_no?: string;
  reference_date?: string;
  references: FrappePaymentReference[];
}

export interface FrappePaymentReference {
  reference_doctype: string;
  reference_name: string;
  allocated_amount: number;
}
