# Fluxo Git

O projeto utiliza somente duas branches permanentes.

## Develop

`develop` concentra desenvolvimento diario, funcionalidades, correcoes, refatoracoes e validacao
local. Push direto e permitido para o unico desenvolvedor, mas force push e proibido.

```bash
git switch develop
git pull --ff-only origin develop
# editar, validar e criar commits
git push origin develop
```

Cada push executa lint, typecheck, testes e build. O Preview da Vercel e opcional e usa exclusivamente
o Supabase DEV.

## Main

`main` representa exclusivamente Production. Nao desenvolva nem envie commits diretamente para
essa branch. A unica entrada aceita e um Pull Request de `develop` para `main`.

```bash
git switch develop
git pull --ff-only origin develop
# abra o Pull Request develop -> main no GitHub
```

Depois do merge, o pipeline repete os gates, verifica migrations pendentes, aplica somente as novas
migrations no Supabase PROD, publica na Vercel e cria a release. Qualquer falha interrompe as etapas
seguintes.

## Protecoes ativas

Para `main`:

- bloquear push direto, force push e delecao;
- exigir Pull Request originado de `develop`;
- exigir os checks `Lint / Code quality` e `Build / Test and build`;
- exigir branch atualizada antes do merge;
- impedir merge enquanto houver conversas pendentes.

Para `develop`:

- bloquear force push e delecao;
- exigir os checks de CI para considerar um commit valido.

As regras estao aplicadas no GitHub. `main` exige Pull Request e os checks `Code quality` e
`Test and build`; `develop` permite o fluxo diario direto, mas bloqueia force push e exclusao.

## Conventional Commits

```text
<tipo>(<escopo opcional>): <descricao>

<corpo opcional>

<rodape opcional>
```

Tipos aceitos: `feat`, `fix`, `refactor`, `style`, `perf`, `docs`, `test`, `build`, `ci`, `chore`,
`revert`.

- `fix` e `perf` geram versao patch.
- `feat` gera versao minor.
- `BREAKING CHANGE` gera versao major.

O arquivo `commitlint.config.cjs` formaliza essa convencao.
