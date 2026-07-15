# Fluxo Git

## Branches permanentes

- `main`: estado de producao. Aceita apenas Pull Requests aprovados de `release/*` ou `hotfix/*`.
- `develop`: integracao das funcionalidades aprovadas para a proxima versao.

## Branches temporarias

- `feature/<descricao>`: funcionalidade nova, criada de `develop`.
- `fix/<descricao>`: correcao regular, criada de `develop`.
- `release/<versao>`: estabilizacao, criada de `develop`.
- `hotfix/<descricao>`: correcao urgente, criada de `main`.

Use nomes em minusculas, ASCII e separados por hifen.

## Nova funcionalidade

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/calendario-operacional
```

Depois do Pull Request aprovado, realize merge em `develop` pela interface do GitHub.

## Release

```bash
git switch develop
git pull --ff-only origin develop
git switch -c release/1.1.0
```

A branch recebe apenas correcoes de estabilizacao. Depois da homologacao, abra Pull Request para
`main`. A automacao de release interpreta os Conventional Commits, cria a tag `vX.Y.Z` e publica as
notas. Sincronize o resultado novamente em `develop`.

## Hotfix

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/corrigir-autenticacao
```

Abra Pull Request para `main` e, apos a publicacao, replique a correcao em `develop`.

## Protecoes recomendadas no GitHub

Para `main`:

- Bloquear push direto e force push.
- Exigir Pull Request e uma aprovacao.
- Exigir branches atualizadas antes do merge.
- Exigir workflows `Lint` e `Build` aprovados.
- Restringir delecao da branch.

Para `develop`:

- Bloquear force push.
- Exigir Pull Request.
- Exigir workflows `Lint` e `Build`.

## Conventional Commits

```text
<tipo>(<escopo opcional>): <descricao>

<corpo opcional>

<rodape opcional>
```

Tipos aceitos:

- `feat`: funcionalidade nova.
- `fix`: correcao de defeito.
- `refactor`: mudanca interna sem alterar comportamento.
- `style`: formatacao sem mudanca funcional.
- `perf`: melhoria de desempenho.
- `docs`: documentacao.
- `test`: testes.
- `build`: build ou dependencias.
- `ci`: automacao.
- `chore`: manutencao.
- `revert`: reversao.

O arquivo `commitlint.config.cjs` formaliza essa convencao.
