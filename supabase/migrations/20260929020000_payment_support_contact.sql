-- Admin-set contact for payment problems (shown to participants as a WhatsApp link).
alter table event_config add column if not exists support_contact_name text not null default '';
alter table event_config add column if not exists support_whatsapp text not null default '';
