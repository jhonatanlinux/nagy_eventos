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
- Staging: nao provisionado enquanto a organizacao permanecer no plano gratuito.
- Production: projeto oficial `penymftuwlipszichtjn`, sem dados de demonstracao.

A aplicacao usa modo demo somente quando `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` nao
estao definidos. `SUPABASE_SECRET_KEY` e estritamente server-side e nunca pode usar o prefixo
`VITE_`.

## Fluxo seguro

Os comandos de validacao e publicacao serao executados pelo GitHub Actions contra cada projeto
remoto. O projeto nao utiliza uma stack Supabase local em Docker.

O seed de Development nao cria credenciais. O primeiro usuario de cada empresa deve ser criado pelo Supabase
Auth e, autenticado, chamar `bootstrap_company` uma unica vez.
