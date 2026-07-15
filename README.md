# NAGY EVENTOS

Plataforma de gestao para locacao de equipamentos e operacoes de eventos. Centraliza clientes,
inventario, agendamentos, financeiro, despesas, usuarios, permissoes e notificacoes em uma
experiencia Web responsiva, PWA e preparada para distribuicao Android.

## Estado do projeto

- Aplicacao Web funcional em React e Vite.
- PWA com cache offline basico e atualizacao automatica.
- Supabase preparado por migrations, RLS, policies, indexes, views e seeds.
- Estrutura inicial de Capacitor, Vercel, Semantic Versioning e GitHub Actions.
- Auditoria tecnica da Fase 01 aprovada sem vulnerabilidades conhecidas.

## Tecnologias

- React 19, React Router e TypeScript strict
- Vite 8 e Tailwind CSS
- TanStack Query e Zustand
- React Hook Form e Zod
- Radix UI e Lucide Icons
- Framer Motion e Recharts
- Supabase: Auth, PostgreSQL, Storage e Realtime
- Vite PWA e Workbox
- Capacitor 8 para Android
- ESLint flat config e Prettier

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- Git 2.40 ou superior
- Android Studio e JDK 21 apenas para desenvolvimento Android

## Instalacao

```bash
git clone https://github.com/jhonatanlinux/nagy_eventos.git
cd nagy_eventos
npm ci
```

Crie o arquivo local de ambiente a partir do modelo correspondente. Nunca versione arquivos com
credenciais reais.

```bash
cp .env.development.example .env.development.local
```

No PowerShell:

```powershell
Copy-Item .env.development.example .env.development.local
```

## Execucao local

```bash
npm run dev
```

Acesse `http://127.0.0.1:5173`.

Enquanto o Supabase nao estiver configurado, a aplicacao utiliza o repositorio local de demonstracao.
O login demo usa `admin@nagyeventos.com` e qualquer senha nao vazia.

## Qualidade e build

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
npm run check
npm audit
```

`npm run check` executa lint, TypeScript e build de producao. O merge deve ser bloqueado se qualquer
uma dessas verificacoes falhar.

## Variaveis de ambiente

| Variavel                        | Descricao                                      | Sensivel                                  |
| ------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| `VITE_APP_ENV`                  | `development` ou `production`                  | Nao                                       |
| `VITE_SUPABASE_URL`             | URL publica do projeto Supabase                | Nao                                       |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publica para clientes Web, PWA e Android | Nao, mas deve ser gerenciada por ambiente |
| `VITE_APP_VERSION`              | Versao injetada pelo pipeline                  | Nao                                       |

Nunca use `SUPABASE_SECRET_KEY`, `service_role`, senha do banco, tokens Vercel ou tokens GitHub em
variaveis prefixadas por `VITE_`; elas sao incorporadas ao bundle do navegador.

Modelos disponiveis:

- `.env.development.example`
- `.env.production.example`

## Supabase

O banco e versionado exclusivamente por migrations em `supabase/migrations`.

O projeto nao utiliza Supabase local em Docker. Development e Production usam projetos remotos
independentes.

Para um ambiente remoto:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase migration list --linked
npx supabase db push --linked --include-all --dry-run
npx supabase db push --linked --include-all
npx supabase db lint --linked --schema public --level warning --fail-on error
```

Nunca conecte o ambiente local ao banco de producao. O seed deve ser incluido somente ao publicar no
projeto DEV. Migrations de Production sao executadas apenas pelo workflow protegido apos merge em
`main`. Consulte o procedimento completo em [supabase/README.md](supabase/README.md).

## Vercel

O arquivo `vercel.json` define build Vite, fallback da SPA, cache e headers de seguranca. Deploys Git
diretos da Vercel estao desativados para impedir publicacao paralela ao pipeline. O GitHub Actions
executa Preview em `develop` e Production em `main` quando `VERCEL_DEPLOY_ENABLED=true`.

Variaveis previstas no GitHub/Vercel:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

O procedimento de ativacao e a ordem dos gates estao em [docs/CI_CD.md](docs/CI_CD.md).

## PWA

O manifest e o Service Worker sao gerados por `vite-plugin-pwa`. Os icones ficam em `public/icons`.
Para regenerar os assets da marca no Windows:

```powershell
.\scripts\generate-brand-assets.ps1
```

## Android

A configuracao base esta em `capacitor.config.ts`. A criacao do projeto nativo pertence a fase Android.
Quando habilitada:

```bash
npm run android:add
npm run android:sync
npm run android:open
npm run android:build
```

APK e AAB devem ser gerados apenas para releases oficiais, nunca a cada commit.

## Estrutura

```text
src/
  app/          providers, router e autenticacao
  components/   design system e componentes compartilhados
  hooks/        hooks transversais
  layouts/      shells autenticado e publico
  lib/          integracoes e utilitarios de infraestrutura
  modules/      dominios funcionais por modulo
  services/     auditoria, busca, exportacao e persistencia
  stores/       estado global
  types/        contratos de dominio
  utils/        formatacao, datas e identificadores
supabase/
  migrations/   historico imutavel do schema
  seed.sql       dados exclusivos de desenvolvimento
docs/            auditorias e documentacao tecnica
.github/         templates e pipelines de automacao
```

## Fluxo Git

| Branch    | Finalidade                                               |
| --------- | -------------------------------------------------------- |
| `develop` | Desenvolvimento diario, testes e Preview                 |
| `main`    | Codigo validado e publicado exclusivamente em Production |

Fluxo recomendado:

1. Desenvolva e valide localmente em `develop`.
2. Use Conventional Commits e envie os commits para `origin/develop`.
3. Abra Pull Request de `develop` para `main` quando a entrega estiver pronta.
4. Integre somente depois de lint, testes e build aprovados.
5. Nunca desenvolva ou envie push direto para `main`.

Detalhes e comandos estao em [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).

## Conventional Commits e SemVer

Formato:

```text
tipo(escopo opcional): descricao objetiva
```

Tipos aceitos: `feat`, `fix`, `refactor`, `style`, `perf`, `docs`, `test`, `build`, `ci`,
`chore` e `revert`.

- `fix` e `perf`: incremento patch (`1.0.0` para `1.0.1`).
- `feat`: incremento minor (`1.0.0` para `1.1.0`).
- `BREAKING CHANGE`: incremento major (`1.0.0` para `2.0.0`).

Tags usam o formato `vX.Y.Z`. A versao exibida no Footer e obtida da tag Git ou injetada pelo
pipeline. A alteracao manual da versao nao faz parte do fluxo normal.

## Contribuicao

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de criar branches, commits ou Pull Requests.

## Documentacao

- [Auditoria tecnica da Fase 01](docs/audits/phase-01-technical-audit.md)
- [Fluxo Git](docs/GIT_WORKFLOW.md)
- [Changelog](CHANGELOG.md)

## Licenca

Distribuido sob a licenca MIT. Consulte [LICENSE](LICENSE).
