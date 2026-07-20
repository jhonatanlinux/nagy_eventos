# Changelog

Todas as alteracoes relevantes deste projeto serao documentadas neste arquivo.
O projeto segue [Semantic Versioning](https://semver.org/) e Conventional Commits.

## [Unreleased]

### Changed

- Auditoria tecnica da Fase 01 concluida.
- ESLint flat config adotado para TypeScript e React.
- Codigo-fonte padronizado com Prettier.
- Documentacao do repositorio revisada com fluxo Git, contribuicao e licenca MIT.
- Workflows iniciais adicionados para lint, build, release, deploy preflight e Android.
- PWA e configuracoes de ambiente revisados.
- Dependencias sem uso ou vulneraveis removidas.
- Modelagem Supabase reforcada com integridade multiempresa, RBAC efetivo e bootstrap autenticado.
- Seed local expandido com perfis, permissoes, categorias e configuracoes padrao.
- Cliente Web migrado para a publishable key oficial do Supabase, com PKCE e persistencia de sessao.
- Ambientes padronizados como Development e Production, sem uso local do Supabase PROD.
- Projeto Supabase Development provisionado e configuracao local isolada de Production.
- Baseline remoto do banco DEV aplicado com tres migrations e seed reproduzivel.
- `pgdelta` experimental desativado para manter o fluxo Supabase sem dependencia de Docker.
- Fluxo Git simplificado para somente `develop` e `main`.
- CI/CD reestruturado com gates de qualidade, migrations, Vercel e Semantic Release encadeados.
- Testes unitarios de RBAC e validacao estrutural dos workflows adicionados ao CI.

### Security

- Dependencias auditadas sem vulnerabilidades conhecidas.
- Politicas de Storage e views do Supabase reforcadas por migration incremental.
- Campos protegidos de perfis, relacionamentos entre tenants e operacoes por permissao validados no banco.
- Chave secreta exposta durante a configuracao inicial revogada e removida do projeto de Production.
- Integridade, isolamento multiempresa e RLS validados no banco DEV por teste transacional.
