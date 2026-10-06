# CMS — Sanity

## Estado

O projeto usa Sanity Studio incorporado em `/studio`, com `next-sanity` 11.x e Sanity 4.x no Next.js 15 e React 19.2.3. O frontend lê conteúdo publicado quando `NEXT_PUBLIC_SANITY_PROJECT_ID` e `NEXT_PUBLIC_SANITY_DATASET` estão definidos. Sem essa configuração, usa os registros locais revisados em `data/portfolio.ts`.

Nenhum projeto Sanity externo foi criado nesta tarefa. O Studio mostra uma orientação de configuração até receber um Project ID. Não há token no repositório.

## Tipos

- `artwork`: title, image, alt, project, layout preset, status, order.
- `project`: title, slug, year, category, description PT/EN, cover, featured, status, order, external links.
- `shopItem`: title, slug, image, description PT/EN, price, currency, external purchase URL, status, order.
- `siteSettings`: site name, descriptions, email, social URLs, home artwork references.

Os campos year, category, description, preço, links externos e dimensões permanecem vazios quando não estão confirmados no inventário. Itens não devem ser publicados até receberem conteúdo aprovado.

## Configuração local

1. Copiar `.env.example` para `.env.local`.
2. Preencher Project ID e dataset do projeto Sanity aprovado.
3. Para migração, preencher `SANITY_API_TOKEN` com token de escrita guardado localmente.
4. Executar `npm run cms:seed` para revisar o dry-run.
5. Somente para aplicar, executar com `SANITY_SEED_CONFIRM=YES` e `--commit`. O dataset `production` também exige `--allow-production`.

O script migra oito projetos e dez obras verificadas (oito capas mais duas imagens adicionais mapeadas em `assets.md`), além das configurações de contato encontradas no legado. Faz upload apenas dos assets listados nos registros, usa IDs determinísticos e `createIfNotExists`, não sobrescreve documentos existentes e não é executado pelo build nem em produção. O primeiro modo é sempre dry-run. O Shop permanece sem produtos até haver itens reais e preços aprovados.

## Conteúdo e imagens

`data/portfolio.ts` é a fonte de fallback sem credenciais. Os textos são cópias do inventário legado, sem as duas notas editoriais assinaladas para revisão. As imagens em `public/legacy/` foram selecionadas dos ZIPs fornecidos e mantêm nomes de arquivo organizados por projeto; nenhuma imagem inventada da implementação anterior alimenta as rotas novas.

## Limite atual

A conexão depende da criação/configuração de um projeto Sanity e de credenciais pela equipe. Até isso ocorrer, o frontend funciona com fallback local e o Studio não grava dados.
