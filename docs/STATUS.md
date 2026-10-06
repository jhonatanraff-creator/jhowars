# Estado do projeto

## Fase atual

CMS Foundation + Legacy Content Migration — base de código e dry-run preparados; migração remota aguarda configuração do Sanity.

## Concluído nesta rodada

- Schemas para HomePost, Artwork, Project, ShopItem, AboutPage singleton, SiteSettings singleton e blocos editoriais.
- Studio organizado por Home, Obras, Projetos, Shop, Sobre e Site, com filtros de disponibilidade, previews, validações e descrições de campos.
- Seed determinístico, dry-run, proteção para produção, SHA-256 na deduplicação, proteção para conteúdo previamente editado e compatibilidade com os IDs do seed V1.
- Ordem de mídia das páginas detalhadas registrada em `data/legacy-modules.json`.
- Preparada migração para oito projetos, dez registros Artwork identificáveis, oito HomePosts, About e SiteSettings; zero ShopItems inventados.
- Data layer centralizada com queries e fallbacks; `/studio` preservada.
- Guia em `docs/CMS.md` e relatório em `docs/CMS_MIGRATION_REPORT.md`.
- Dry-run executado repetidamente sem escrita remota; pré-validação local confirmou 28 IDs únicos e referências planejadas resolvíveis.
- `npm run typecheck` e `npm run build` aprovados; rota `/studio` responde HTTP 200 e mostra configuração pendente.
- ESLint dos arquivos alterados passou.

## Pendente

- Configurar `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` e `SANITY_API_TOKEN` localmente.
- Gravar o seed e confirmar uploads, referências, deduplicação e idempotência no dataset escolhido.
- Abrir o Studio conectado para revisão humana dos dados migrados.
- Revisar projetos com conteúdo incompleto e atualizar a URL assinada do vídeo Adobe, se necessário.
- `npm run lint` global retorna um erro preexistente em `next-env.d.ts:3` e dois avisos antigos de configuração.
- A rota `/studio` ainda não pode abrir o Studio conectado, pois o Project ID não está configurado.
- Aguardar nova rodada para conectar os dados à direção visual aprovada; QA visual e deploy seguem pendentes.

## Próximo passo

“Configurar o projeto e dataset Sanity, revisar o dry-run e executar a migração para iniciar o QA de conteúdo.”

## Validação e Git

- Branch: `feat/cms-v1-redesign`.
- Sem alteração de interface, merge ou deploy nesta rodada.
- Resultados completos de validação: `docs/CMS_MIGRATION_REPORT.md`.
