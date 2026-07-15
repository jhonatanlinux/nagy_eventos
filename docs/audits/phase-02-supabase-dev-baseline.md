# Fase 02 - Baseline Supabase DEV

## Escopo

Esta fase aplicou e validou o schema versionado exclusivamente no projeto
`nagy-eventos-dev` (`gbsaotppqslqaeueohps`). Nenhuma operacao de banco foi executada em Production.

## Execucao

1. Vinculo da Supabase CLI confirmado com o projeto DEV.
2. Historico remoto inicialmente vazio.
3. Dry-run aprovado antes da alteracao remota.
4. Tres migrations aplicadas em ordem cronologica.
5. `supabase/seed.sql` aplicado somente em Development.
6. Lint remoto e teste transacional de integridade executados.

## Migrations aplicadas

- `202607070001_initial_schema.sql`
- `202607140001_harden_views_and_storage.sql`
- `202607140002_production_integrity_and_rbac.sql`

## Validacoes

| Verificacao                    | Resultado |
| ------------------------------ | --------- |
| Historico local/remoto         | 3 de 3    |
| Erros no lint do schema public | 0         |
| Perfis de acesso no seed       | 6         |
| Categorias no seed             | 5         |
| Configuracoes no seed          | 2         |
| Dados residuais do teste       | 0         |
| RLS nas tabelas centrais       | Ativo     |

O teste `supabase/tests/database_integrity.sql` foi executado dentro de uma transacao e finalizado
com `ROLLBACK`.

## Docker

A CLI tentou usar uma imagem auxiliar porque `experimental.pgdelta` estava habilitado. A opcao foi
desativada em `supabase/config.toml`, e a imagem baixada foi removida. Ao final da fase existem zero
imagens e zero containers Supabase no Docker.

## Restricoes

- STAGING nao foi provisionado por causa do limite do plano gratuito.
- Production continua sem migrations aplicadas por esta fase.
- O seed e proibido fora de Development.
