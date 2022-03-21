export interface Subscription {
  id: string;
  plan_id: string;
  plan_quantity: number;
  plan_unit_price: number;
  billing_period: number;
  billing_period_unit: string;
  customer_id: string;
  plan_amount: number;
  plan_free_quantity: number;
  status: string;
  current_term_start: number;
  current_term_end: number;
  next_billing_at: number;
  created_at: number;
  started_at: number;
  activated_at: number;
  created_from_ip: string;
  updated_at: number;
  has_scheduled_changes: boolean;
  channel: string;
  resource_version: number;
  deleted: boolean;
  object: string;
  currency_code: string;
  due_invoices_count: number;
  due_since: number;
  total_dues: number;
  mrr: number;
  exchange_rate: number;
  base_currency_code: string;
  cf_discord_server_invite: string;
  cf_discord_server_id: string;
}

export interface Customer {
  id: string;
  email: string;
  auto_collection: string;
  net_term_days: number;
  allow_direct_debit: boolean;
  created_at: number;
  created_from_ip: string;
  taxability: string;
  updated_at: number;
  locale: string;
  pii_cleared: string;
  resource_version: number;
  deleted: boolean;
  object: string;
  billing_address: BillingAddress;
  card_status: string;
  promotional_credits: number;
  refundable_credits: number;
  excess_payments: number;
  unbilled_charges: number;
  preferred_currency_code: string;
  primary_payment_source_id: string;
  payment_method: PaymentMethod;
  cf_discord_discriminator: string;
  cf_discord_id_dont_know_disgdfindmyid: string;
  cs_usage_agreement: boolean;
  cs_refund_agreement: boolean;
  channel: string;
}
export interface BillingAddress {
  first_name: string;
  last_name: string;
  line1: string;
  city: string;
  state_code: string;
  state: string;
  country: string;
  zip: string;
  validation_status: string;
  object: string;
}
export interface PaymentMethod {
  object: string;
  type: string;
  reference_id: string;
  gateway: string;
  gateway_account_id: string;
  status: string;
}
