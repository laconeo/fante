-- Run this SQL in your Supabase dashboard → SQL Editor

-- Tabla de pacientes
create table if not exists patients (
  id text primary key,
  name text not null,
  age integer,
  birth_date text,
  email text,
  avatar text,
  progress integer default 0,
  last_active text,
  course text default 'Sin asignar',
  created_at timestamptz default now()
);

-- Habilitar acceso publico (sin autenticacion por ahora)
alter table patients enable row level security;
create policy "Allow all operations on patients" on patients for all using (true) with check (true);

-- Tabla de cursos
create table if not exists courses (
  id text primary key,
  title text not null,
  description text,
  cover_image_url text,
  category text,
  author_id text,
  visibility text default 'public',
  target_age_min integer,
  target_age_max integer,
  schema_version text default '1.0',
  weeks jsonb default '[]',
  created_at timestamptz default now()
);

alter table courses enable row level security;
create policy "Allow all operations on courses" on courses for all using (true) with check (true);
