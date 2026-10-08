-- ============================================
-- YURI PERSONAL - Setup Supabase
-- Cole isso em: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================

-- 1. PROFILES (liga auth.users com papel admin/aluno)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nome text,
  whatsapp text,
  role text not null default 'aluno' check (role in ('admin','aluno')),
  ativo boolean not null default true,
  created_at timestamp with time zone default now()
);

-- 2. EXERCÍCIOS (biblioteca por grupo muscular)
create table if not exists public.exercicios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  grupo text not null check (grupo in ('peito','costas','pernas','ombros','biceps','triceps','abdomen','gluteos','cardio','mobilidade')),
  nivel text default 'todos' check (nivel in ('iniciante','intermediario','avancado','todos')),
  descricao text,
  execucao text,          -- passo a passo
  erros_comuns text,
  video_url text,         -- link YT (watch, shorts, youtu.be) ou mp4 direto
  thumbnail_url text,
  criado_em timestamp with time zone default now()
);

-- 3. PLANOS (treinos por objetivo, pros leigos)
create table if not exists public.planos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  objetivo text not null check (objetivo in ('iniciante_casa','hipertrofia','emagrecimento','forca','mobilidade')),
  nivel text default 'todos',
  dias_por_semana int default 3,
  descricao text,
  criado_em timestamp with time zone default now()
);

-- 4. DIAS DO PLANO
create table if not exists public.plano_dias (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid not null references public.planos(id) on delete cascade,
  dia_ordem int not null, -- 1..7
  titulo text not null,   -- ex: "A - Peito + Tríceps"
  foco text
);

-- 5. EXERCÍCIOS DO DIA
create table if not exists public.plano_exercicios (
  id uuid primary key default gen_random_uuid(),
  plano_dia_id uuid not null references public.plano_dias(id) on delete cascade,
  exercicio_id uuid not null references public.exercicios(id) on delete restrict,
  series int default 3,
  repeticoes text default '10-12',
  descanso_seg int default 60,
  observacao text,
  ordem int default 1
);

-- 6. FICHA DO ALUNO (resultado da montagem automática / plano atribuído)
create table if not exists public.fichas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  plano_id uuid references public.planos(id) on delete set null,
  titulo_semana text,
  semana_inicio date default current_date,
  dias_treino int[] default '{1,3,5}',
  treino_json jsonb, -- guarda a montagem automática {dias:[{titulo, foco, exercicios:[...]}]}
  gerado_auto boolean default false,
  ativo boolean default true,
  criado_em timestamp with time zone default now()
);

-- ============================================
-- RLS
-- ============================================
alter table public.profiles enable row level security;
alter table public.exercicios enable row level security;
alter table public.planos enable row level security;
alter table public.plano_dias enable row level security;
alter table public.plano_exercicios enable row level security;
alter table public.fichas enable row level security;

-- Helper: é admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: usuário vê o próprio, admin vê tudo
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
drop policy if exists "admin insert profile" on public.profiles;
create policy "admin insert profile" on public.profiles for insert with check (public.is_admin() or auth.uid() = id);
drop policy if exists "admin update profile" on public.profiles;
create policy "admin update profile" on public.profiles for update using (auth.uid() = id or public.is_admin());

-- conteúdo: qualquer logado ativo lê; só admin escreve
drop policy if exists "read exercicios" on public.exercicios;
create policy "read exercicios" on public.exercicios for select using (auth.role() = 'authenticated');
drop policy if exists "admin write exercicios" on public.exercicios;
create policy "admin write exercicios" on public.exercicios for all using (public.is_admin());

drop policy if exists "read planos" on public.planos;
create policy "read planos" on public.planos for select using (auth.role() = 'authenticated');
drop policy if exists "admin write planos" on public.planos;
create policy "admin write planos" on public.planos for all using (public.is_admin());

drop policy if exists "read plano_dias" on public.plano_dias;
create policy "read plano_dias" on public.plano_dias for select using (auth.role() = 'authenticated');
drop policy if exists "admin write plano_dias" on public.plano_dias;
create policy "admin write plano_dias" on public.plano_dias for all using (public.is_admin());

drop policy if exists "read plano_exercicios" on public.plano_exercicios;
create policy "read plano_exercicios" on public.plano_exercicios for select using (auth.role() = 'authenticated');
drop policy if exists "admin write plano_exercicios" on public.plano_exercicios;
create policy "admin write plano_exercicios" on public.plano_exercicios for all using (public.is_admin());

drop policy if exists "own fichas" on public.fichas;
create policy "own fichas" on public.fichas for select using (aluno_id = auth.uid() or public.is_admin());
drop policy if exists "admin insert ficha" on public.fichas;
create policy "admin insert ficha" on public.fichas for insert with check (public.is_admin() or aluno_id = auth.uid());
drop policy if exists "own update ficha" on public.fichas;
create policy "own update ficha" on public.fichas for update using (aluno_id = auth.uid() or public.is_admin());

-- ============================================
-- SEED: exercícios exemplo (12)
-- ============================================
insert into public.exercicios (nome, grupo, nivel, descricao, execucao, video_url) values
('Supino reto com halteres','peito','todos','Peitoral maior, ombros e tríceps.','1. Deite no banco, pés no chão. 2. Desça até 90° no cotovelo. 3. Suba sem travar.','https://www.youtube.com/watch?v=rT7DgCr-3pg'),
('Flexão de braço','peito','iniciante','Base de empurrar, faz em qualquer lugar.','1. Prancha, mãos na linha do peito. 2. Desça peito perto do chão. 3. Empurre. Joelhos no chão p/ regredir.',''),
('Puxada alta','costas','todos','Dorsais e bíceps.','1. Pegada aberta. 2. Puxe até o peito. 3. Volte controlado.',''),
('Remada curvada','costas','intermediario','Dorsais, trapézio, lombar.','1. Tronco ~45°. 2. Puxe barra ao abdômen. 3. Escápulas juntas.',''),
('Agachamento livre','pernas','todos','Quadríceps, glúteos e core.','1. Pés na largura do ombro. 2. Quadril pra trás e pra baixo. 3. Joelho segue a ponta do pé.',''),
('Afundo','pernas','iniciante','Unilateral, ótimo pra casa.','1. Passo à frente. 2. Desça até 90/90. 3. Troque.',''),
('Desenvolvimento com halteres','ombros','todos','Deltóides completo.','1. Sentado, core firme. 2. Empurre acima da cabeça. 3. Desça até orelha.',''),
('Rosca direta','biceps','todos','Bíceps.','1. Cotovelos fixos ao lado. 2. Suba sem balançar. 3. Desça em 2s.',''),
('Tríceps testa','triceps','todos','Tríceps.','1. Deitado, halteres acima. 2. Desça até testa. 3. Estenda.',''),
('Prancha','abdomen','todos','Core.','1. Cotovelos no chão. 2. Corpo reto. 3. Segure 30-60s respirando.',''),
('Elevação pélvica','gluteos','todos','Glúteos e posterior.','1. Costas no banco/chão. 2. Suba quadril. 3. Segure 1s em cima.',''),
('Polichinelo','cardio','iniciante','Aquecimento cardio sem equipamento.','1. Abra braços/pernas juntos. 2. Ritmo constante 30-60s.','')
on conflict do nothing;

insert into public.planos (nome, objetivo, nivel, dias_por_semana, descricao) values
('Start em Casa - Iniciante','iniciante_casa','iniciante',3,'Só peso corporal, 30min, pra criar constância.'),
('Hipertrofia Academia - ABC','hipertrofia','intermediario',5,'Divisão clássica pra ganhar massa.'),
('Secar - Fullbody + Cardio','emagrecimento','todos',4,'Fullbody + cardio pra gastar mais.')
on conflict do nothing;
