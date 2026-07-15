# Ambientes

O NAGY EVENTOS usa tres ambientes isolados. Nenhum desenvolvimento local ou Preview pode acessar o
banco de producao.

| Ambiente    | Branch/Origem                         | Supabase                                    | Vercel                 | Estado                         |
| ----------- | ------------------------------------- | ------------------------------------------- | ---------------------- | ------------------------------ |
| Development | `feature/*`, `fix/*` e execucao local | `nagy-eventos-dev` (`gbsaotppqslqaeueohps`) | Development/Preview    | Ativo e isolado                |
| Staging     | `develop`                             | `nagy-eventos-staging`                      | Preview de homologacao | Nao provisionado no plano Free |
| Production  | `main`                                | `nagy_eventos` (`penymftuwlipszichtjn`)     | Production             | Ativo e isolado                |

## Regras

- Chaves e bancos sao independentes por ambiente.
- Somente publishable keys podem ser usadas no cliente Web/PWA/Android.
- Secret keys nunca usam prefixo `VITE_` e nao sao necessarias para migrations.
- Migrations de producao sao executadas exclusivamente pelo pipeline protegido.
- O arquivo `.env.local` deve apontar apenas para Development e permanece ignorado pelo Git.
- `.env.local` aponta exclusivamente para Development; producao nunca e usada na execucao local.
- O plano gratuito permite dois projetos ativos. STAGING permanece sem banco dedicado e nao pode
  receber migrations ou dados ate que exista capacidade de ambiente adicional.

## Variaveis por ambiente

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_ACCESS_TOKEN`

As variaveis `SUPABASE_*` sem prefixo `VITE_` sao exclusivas do GitHub Actions ou de componentes
server-side. Nunca registre seus valores em arquivos versionados.
