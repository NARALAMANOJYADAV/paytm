-- Section is typed by the student (not a fixed A–D list); stored upper-case.
alter table participant_profiles drop constraint if exists participant_profiles_section_check;
alter table participant_profiles add constraint participant_profiles_section_check check (section ~ '^[A-Z0-9]{1,3}$');
-- Roll numbers are compared case-insensitively (unique index on upper(roll_number) already) and stored upper-case.
alter table participant_profiles add constraint participant_profiles_roll_upper check (roll_number = upper(roll_number)) not valid;
