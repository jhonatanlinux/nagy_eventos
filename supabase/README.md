# Supabase - NAGY EVENTOS

Esta pasta contem a modelagem inicial para Supabase.

- `migrations/202607070001_initial_schema.sql`: schema normalizado, relacionamentos, indices, views e RLS.
- A aplicacao roda em modo demo local quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nao estao definidos.
- Para producao, configure as variaveis na Vercel e aplique as migrations no projeto Supabase.
