# Supabase - NAGY EVENTOS

Toda estrutura permanente do banco deve ser criada por migrations versionadas. Nao altere tabelas,
policies, funcoes ou views diretamente no Dashboard.

## Estrutura

- `migrations/`: migrations aplicadas em ordem cronologica.
- `rollbacks/`: procedimentos de emergencia revisados manualmente; nao sao executados pela CLI.
- `seed.sql`: dados reproduziveis exclusivos de Development.
- `config.toml`: configuracao versionada do Supabase CLI.

## Ambientes

- Development: projeto `nagy-eventos-dev` (`gbsaotppqslqaeueohps`), isolado e ativo.
- Production: projeto oficial `penymftuwlipszichtjn`, sem dados de demonstracao.

A aplicacao usa modo demo somente quando `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` nao
estao definidos. `SUPABASE_SECRET_KEY` e estritamente server-side e nunca pode usar o prefixo
`VITE_`.

## Fluxo seguro

O projeto nao utiliza uma stack Supabase local em Docker. A opcao experimental `pgdelta` permanece
desativada para impedir que a CLI baixe ou execute imagens auxiliares.

Antes de qualquer operacao, confirme o projeto vinculado:

```bash
npx supabase link --project-ref gbsaotppqslqaeueohps
npx supabase migration list --linked
```

O fluxo de Development exige um dry-run antes da aplicacao real:

```bash
npx supabase db push --linked --include-all --include-seed --dry-run
npx supabase db push --linked --include-all --include-seed
npx supabase db lint --linked --schema public --level warning --fail-on error
```

O seed e exclusivo de Development. Nunca use `--include-seed` em Production. Migrations de
Production sao verificadas e executadas somente pelo workflow chamado depois de um merge em `main`.
O workflow valida explicitamente o project ref de Production e interrompe o deploy se o dry-run ou a
aplicacao falhar.

O seed de Development nao cria credenciais. O primeiro usuario de cada empresa deve ser criado pelo
Supabase Auth e, autenticado, chamar `bootstrap_company` uma unica vez.
