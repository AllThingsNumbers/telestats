-- Uruchom w Supabase: SQL Editor -> New query -> wklej -> Run.

-- 1) Tabela na zgłoszenia z formularza (poczekalnia przed moderacją)
create table if not exists zgloszenia (
  id            bigint generated always as identity primary key,
  utworzono     timestamptz not null default now(),
  program       text not null check (program in ('va-banque','1-z-10','familiada')),
  numer_odcinka int,
  data_emisji   date,
  zrodlo        text check (char_length(zrodlo) <= 500),
  zawodnicy     text check (char_length(zawodnicy) <= 5000),
  pytania       text not null check (char_length(pytania) <= 50000),
  autor         text check (char_length(autor) <= 100),
  status        text not null default 'nowe'
);

-- 2) RLS: publiczny klucz może TYLKO dodawać nowe zgłoszenia (nie czytać, nie zmieniać, nie usuwać)
alter table zgloszenia enable row level security;
create policy "formularz moze dodawac" on zgloszenia
  for insert to anon with check (status = 'nowe');

-- 3) WAŻNE: włącz RLS także na tabelach z danymi i pozwól publicznemu kluczowi tylko CZYTAĆ.
--    Bez tego każdy, kto zna publiczny klucz, mógłby zmieniać lub usuwać Twoje dane.
alter table vabanque_odcinki enable row level security;
alter table vabanque_pytania enable row level security;
alter table vabanque_gracze  enable row level security;
alter table vabanque_przebieg enable row level security;
create policy "odczyt publiczny" on vabanque_odcinki  for select to anon using (true);
create policy "odczyt publiczny" on vabanque_pytania  for select to anon using (true);
create policy "odczyt publiczny" on vabanque_gracze   for select to anon using (true);
create policy "odczyt publiczny" on vabanque_przebieg for select to anon using (true);
