# Contribuindo com o NAGY EVENTOS

## Antes de comecar

1. Leia o README e o fluxo em `docs/GIT_WORKFLOW.md`.
2. Confirme que a issue possui objetivo e criterios de aceite.
3. Nunca use dados ou credenciais de producao localmente.
4. Mantenha regras de negocio nos services/hooks e componentes focados em interface.

## Branches

Crie branches a partir de `develop`:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/minha-funcionalidade
```

Prefixos: `feature/`, `fix/`, `release/` e `hotfix/`.

## Commits

Use Conventional Commits:

```text
feat(agenda): add collection confirmation
fix(financeiro): prevent duplicate cash entry
docs: update local environment setup
```

Use `BREAKING CHANGE:` no corpo quando houver incompatibilidade de contrato.

## Qualidade obrigatoria

```bash
npm ci
npm run format:check
npm run check
npm audit --audit-level=high
```

Nao ignore erros de lint ou TypeScript. Excecoes devem ser tecnicamente justificadas no Pull Request.

## Banco de dados

- Toda alteracao de schema deve ser uma nova migration.
- Nao edite migrations que ja foram aplicadas em ambiente compartilhado.
- Policies RLS e indexes devem acompanhar a migration da funcionalidade.
- Seeds devem conter apenas dados reproduziveis de desenvolvimento.

## Pull Request

Inclua:

- Problema resolvido e escopo.
- Evidencias de validacao.
- Impacto visual, com capturas quando aplicavel.
- Migration, variaveis ou passos operacionais novos.
- Riscos e estrategia de rollback.

Solicite revisao antes do merge. Nao envie diretamente para `main`.

## Seguranca

Nao abra issue publica para vulnerabilidade exploravel. Comunique o mantenedor do repositorio de
forma privada e nao inclua tokens, chaves, dumps ou dados pessoais em commits e logs.
