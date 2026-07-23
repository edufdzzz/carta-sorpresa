-- Carta Sorpresa — migración 002: nuevo flujo de la carta
-- (sobre -> pantallas de mensaje -> pregunta con juego Sí/No -> carta final con fotos)
--
-- Cómo usar: en tu proyecto de Supabase, ve a "SQL Editor" -> "New query",
-- pega TODO este archivo y dale "Run". Solo se corre una vez.
--
-- Nota: esto reemplaza la tabla `cards` por completo. Como en este punto
-- solo hay cartas de prueba, se recrea desde cero en vez de migrar datos.

drop table if exists public.cards cascade;

create table public.cards (
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

create index cards_user_id_idx on public.cards (user_id);

alter table public.cards enable row level security;

create policy "Las cartas son públicas para lectura"
  on public.cards for select
  using (true);

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
