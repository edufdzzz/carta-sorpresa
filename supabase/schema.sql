-- Carta Sorpresa — esquema de Supabase
-- Cómo usar: en tu proyecto de Supabase, ve a "SQL Editor" -> "New query",
-- pega TODO este archivo y dale "Run". Solo se corre una vez.

-- ============================================================
-- 1. Tabla profiles (1 fila por usuario autenticado)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_unlocked boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Los usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- No hay política de update/insert para usuarios normales:
-- el perfil se crea automáticamente (trigger de abajo) y solo el
-- webhook de Stripe (que usa la service_role key, la cual ignora RLS)
-- puede marcarlo como desbloqueado.

-- Crea automáticamente un profile cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. Tabla cards (una fila por carta creada)
-- ============================================================
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  intro_slides jsonb not null default '[]'::jsonb,
  question_title text not null default '¿Quieres ser mi San Valentín?',
  question_yes_label text not null default '¡Sí, ACEPTO!',
  question_no_label text not null default 'No',
  final_title text not null default '',
  final_message text not null default '',
  final_closing text not null default '',
  theme jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cards_user_id_idx on public.cards (user_id);

alter table public.cards enable row level security;

-- Cualquiera puede leer una carta por su slug (así funciona el link público,
-- sin necesidad de haber iniciado sesión).
create policy "Las cartas son públicas para lectura"
  on public.cards for select
  using (true);

-- Solo el dueño puede crear cartas a su propio nombre, y solo si:
--   - ya está desbloqueado (pagó), o
--   - todavía no llega a 5 cartas creadas.
-- Esta regla vive en la base de datos (no solo en el frontend) para que
-- nadie la pueda saltar llamando directo a la API.
create policy "Crear carta respetando el límite gratuito"
  on public.cards for insert
  with check (
    auth.uid() = user_id
    and (
      coalesce((select is_unlocked from public.profiles where id = auth.uid()), false) = true
      or (select count(*) from public.cards where user_id = auth.uid()) < 5
    )
  );

create policy "Solo el dueño edita su carta"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Solo el dueño borra su carta"
  on public.cards for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. Storage: bucket de fotos
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

-- Lectura pública (para que la carta se vea sin sesión iniciada)
create policy "Lectura pública de fotos"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Solo usuarios autenticados pueden subir, y solo dentro de una carpeta
-- con su propio user_id como prefijo (ej: "photos/<user_id>/foto1.jpg"),
-- para que no puedan sobrescribir ni ver las rutas de otros.
create policy "Usuarios autenticados suben sus propias fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Usuarios borran sus propias fotos"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
