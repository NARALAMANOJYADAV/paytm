-- Admin-managed UPI payee name shown in payment apps (pn= in the upi:// link).
alter table event_config add column if not exists upi_payee_name text not null default 'NBKRIST IT & AI&DS';
