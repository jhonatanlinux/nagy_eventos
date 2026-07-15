# Ambientes

O NAGY EVENTOS usa dois ambientes isolados. Nenhum desenvolvimento local ou Preview pode acessar o
banco de producao.

| Ambiente    | Branch/Origem              | Supabase                                    | Vercel        | Estado                       |
| ----------- | -------------------------- | ------------------------------------------- | ------------- | ---------------------------- |
| Development | `develop` e execucao local | `nagy-eventos-dev` (`gbsaotppqslqaeueohps`) | Local/Preview | Baseline aplicado e validado |
| Production  | `main`                     | `nagy_eventos` (`penymftuwlipszichtjn`)     | Production    | Deploy aguardando ativacao   |

## Regras

- Chaves e bancos sao independentes por ambiente.
- Somente publishable keys podem ser usadas no cliente Web/PWA/Android.
- Secret keys nunca usam prefixo `VITE_` e nao sao necessarias para migrations.
- Migrations de producao sao executadas exclusivamente pelo pipeline protegido.
- `.env.local` aponta exclusivamente para Development; producao nunca e usada na execucao local.
- Preview utiliza o projeto Development; nao existe ambiente intermediario.

## Variaveis por ambiente

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_ACCESS_TOKEN`

As variaveis `SUPABASE_*` sem prefixo `VITE_` sao exclusivas do GitHub Actions ou de componentes
server-side. Nunca registre seus valores em arquivos versionados.
