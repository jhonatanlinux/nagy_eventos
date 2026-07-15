# CI/CD

## Fluxo

```text
develop -> lint + typecheck + testes + build -> Preview opcional
develop -> Pull Request -> main
main -> gates finais -> migrations pendentes -> Production -> release
```

Somente `develop` e `main` sao aceitas pelos workflows. O deploy permanece desativado ate que a
variavel de repositorio `VERCEL_DEPLOY_ENABLED` seja definida como `true`.

## Workflows

- `lint.yml`: Prettier, ESLint e Conventional Commits.
- `build.yml`: typecheck, testes, validacao dos workflows e build Vite/PWA.
- `migration.yml`: workflow reutilizavel que atua somente no Supabase PROD e nunca executa seed.
- `deploy.yml`: Preview de `develop`; em `main`, gates, migrations, versao e Production.
- `release.yml`: Semantic Release chamado apenas depois do deploy Production.
- `android.yml`: APK e AAB somente quando uma GitHub Release e publicada.

## Ordem de Production

1. Executar `npm run ci`.
2. Confirmar que o project ref e `penymftuwlipszichtjn`.
3. Executar `supabase db push --dry-run`.
4. Ignorar migrations quando o banco estiver atualizado.
5. Aplicar migrations pendentes sem seed.
6. Interromper o pipeline se migration ou lint remoto falhar.
7. Calcular a proxima versao por Semantic Release em dry-run.
8. Compilar o Footer com `VITE_APP_VERSION=vX.Y.Z`.
9. Publicar o artefato prebuilt na Vercel Production.
10. Atualizar `package.json`, `package-lock.json` e `CHANGELOG.md`.
11. Criar commit `[skip ci]`, tag e GitHub Release.

## GitHub Environments

Crie `preview` com:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Crie `production` com:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_DB_PASSWORD`

`SUPABASE_PROJECT_ID` deve ser exatamente `penymftuwlipszichtjn`.

## Vercel Environments

Configure em Preview:

- `VITE_APP_ENV=development`
- `VITE_SUPABASE_URL` do projeto DEV
- `VITE_SUPABASE_PUBLISHABLE_KEY` do projeto DEV

Configure em Production:

- `VITE_APP_ENV=production`
- `VITE_SUPABASE_URL` do projeto PROD
- `VITE_SUPABASE_PUBLISHABLE_KEY` do projeto PROD

`vercel.json` desativa deploys Git automaticos. Os deploys sao enviados exclusivamente pelo GitHub
Actions depois dos gates, usando a Vercel CLI fixada na versao `56.2.0`.

## Ativacao

1. Autentique a Vercel CLI e vincule o projeto.
2. Cadastre os environments e secrets acima no GitHub.
3. Cadastre as variaveis publicas nos environments da Vercel.
4. Defina `VERCEL_DEPLOY_ENABLED=true` no repositorio.
5. Valide primeiro um push em `develop`.
6. Abra Pull Request de `develop` para `main` somente depois do Preview aprovado.

Sem a flag, lint, testes e build continuam funcionando, mas migrations e deploys sao ignorados.
