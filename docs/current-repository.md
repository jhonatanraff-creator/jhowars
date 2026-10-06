# Auditoria do repositório atual

## Identificação e estado

- Repositório `jhowars`, remote `https://github.com/jhonatanraff-creator/jhowars.git`.
- Base auditada: `main`, limpa e sincronizada com `origin/main` no início da tarefa. A documentação foi criada na branch `feat/legacy-audit-foundation`.
- Stack: Next.js 15.4.6; React 19.1.1; TypeScript 5.9.2; Tailwind CSS 4.1.12.
- Scripts npm: `dev`, `build`, `start`, `lint`. `typecheck` não está definido em `package.json`.

## Estrutura existente

- `app/`: App Router com `/`, `/work`, `/work/[slug]`, `/about`, `/contact`; layout raiz, CSS global, `sitemap.ts`, `robots.ts` e `icon.svg`.
- `components/`: `artwork-media`, `featured-projects`, `footer`, `header`, `motion-layer`, `page-motion`, `preferences` e `project-card`.
- `data/projects.ts`: tipos e dados de seis projetos com título, slug, categoria, ano, descrição, pasta, orientação e layout.
- `lib/project-content.ts`: lê conteúdo de `public/art/*/content.md`, descobre projetos e imagens e emite diagnósticos.
- `public/art/`: oito pastas de projetos/obras com conteúdo e imagens; `public/brand/`: três arquivos de logo/símbolo; `public/fonts/`: 21 arquivos Ondo (OTF/TTF) e TwinMarker.
- `app/layout.tsx`: metadata base `https://jhowars.com`, título, descrição, keywords, Open Graph, robots e `lang=pt-BR`; preferências de tema/idioma ficam em `PreferencesProvider`.
- `app/sitemap.ts` gera páginas fixas e projetos descobertos. `app/robots.ts` libera rastreamento e aponta para `/sitemap.xml`.
- Responsive e motion estão em `app/globals.css`, com media queries incluindo 760 px e `prefers-reduced-motion`. Tailwind está no PostCSS, mas não há arquivo dedicado de configuração; a interface usa CSS próprio.
- `next.config.ts` configura AVIF/WebP do Next Image. Também há `eslint.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `package-lock.json` e `.gitignore`.
- Integrações: não foram encontrados CMS, API de conteúdo, banco, analytics ou autenticação. Conteúdo/catálogo são lidos do filesystem.
- Deploy: não há `vercel.json`, workflow, Dockerfile ou configuração de hosting versionada; `next.config.ts` é a configuração de execução observada.

## Aproveitável em tese

A configuração App Router, metadata, sitemap/robots, TypeScript e lint podem servir de referência técnica após definição da arquitetura. Componentes, conteúdo, dados, assets e CSS pertencem à implementação anterior e ainda não foram aprovados como base visual nova.

## Legado e decisões pendentes

O README chama textos, contatos e imagens da primeira versão de placeholders a revisar antes da publicação. A interface existente não foi corrigida, redesenhada, ampliada ou substituída nesta tarefa. Depois das referências, decidir manter/refatorar/remover componentes e layout, arquitetura de conteúdo e seleção de assets. Nenhuma integração externa ou plataforma de deploy foi presumida.
