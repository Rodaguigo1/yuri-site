-- ============================================
-- MIGRACAO 02 - Admin completo (beta)
-- Rode em: Supabase > SQL Editor > New Query > Run
-- (depois do supabase-setup.sql)
-- ============================================

-- Admin pode EXCLUIR profile (apaga fichas junto pelo cascade).
-- Obs: o usuario de login (auth.users) precisa ser removido em
-- Authentication > Users, ou apenas desativado com ativo=false.
drop policy if exists "admin delete profile" on public.profiles;
create policy "admin delete profile" on public.profiles for delete using (public.is_admin());

-- Admin pode excluir fichas (limpeza)
drop policy if exists "admin delete ficha" on public.fichas;
create policy "admin delete ficha" on public.fichas for delete using (public.is_admin());
