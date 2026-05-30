alter table events add column if not exists is_featured boolean not null default false;

-- Solo un evento puede estar featured a la vez (opcional pero prolijo)
create unique index if not exists events_featured_unique on events (is_featured) where is_featured = true;
