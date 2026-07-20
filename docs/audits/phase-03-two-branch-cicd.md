# Fase 03 - Fluxo Git e CI/CD com duas branches

## Objetivo

Simplificar o projeto para utilizar somente `develop` e `main`, mantendo migrations de Production
como gate obrigatorio antes do deploy.

## Alteracoes

- Historico da antiga branch de infraestrutura incorporado por fast-forward em `develop`.
- Branch temporaria removida localmente e no GitHub.
- Protecoes aplicadas em `main` e `develop` no GitHub.
- Referencias ao fluxo anterior removidas de documentos e configuracoes.
- Workflows separados para lint, build/testes, migrations, deploy e release.
- Preview limitado a `develop` e Production limitado a `main`.
- Semantic Release executado somente depois do deploy Production.
- Footer compilado com a versao calculada para o mesmo deploy.
- Deploy protegido por flag enquanto Vercel e GitHub Environments nao estiverem configurados.

## Seguranca

- Production migrations validam um project ref fixo antes de conectar.
- Seed e proibido no workflow de Production.
- Falha de migration impede build e deploy produtivos.
- Deploy Git automatico da Vercel esta desativado para evitar corrida com o GitHub Actions.
- Nenhum secret e armazenado no repositorio.

## Protecao de branches

- `main`: Pull Request obrigatorio, branch atualizada, historico linear, conversas resolvidas e
  checks `Code quality` e `Test and build` aprovados.
- `develop`: push diario permitido, com force push e exclusao bloqueados.
