# Estado do projeto

## Fase atual

CMS + migration + redesign + implementation V1 — aguardando QA humano.

## Concluído

- Revisada a auditoria anterior e a documentação de páginas, projetos, textos, rotas, marca e assets.
- Implementadas as rotas `/`, `/projetos`, `/projetos/[slug]`, `/sobre`, `/shop` e `/studio`.
- Criados schemas Sanity para artwork, project, shopItem e siteSettings; o frontend tem fallback local sem credenciais.
- Criado seed conservador: dry-run padrão, exige confirmação explícita para escrita, bloqueia `production` sem argumento adicional e nunca substitui documentos existentes.
- Migradas para `public/legacy/` oito capas, duas imagens de galeria mapeadas e duas variantes oficiais do wordmark, selecionadas do ZIP.
- Atualizadas metadata/sitemap e redirecionamentos das principais rotas anteriores.
- Preservada a implementação anterior no repositório; rotas novas não usam seus textos ou imagens geradas.
- Documentados CMS e sistema visual V1.

## Pendente

- Configurar o projeto externo Sanity e suas variáveis seguras.
- Revisar conteúdo, composição e comportamento em desktop/mobile no QA humano.
- Confirmar seleção final e ordem de todas as obras; enriquecer galerias com imagens verificadas.
- Inserir produtos reais e preços aprovados antes de abrir a loja.
- Revisar redirects legados, metadados finais e acessibilidade.
- Aprovação de design, QA final e deploy.

## Próximo passo

“Revisar a V1 nos tamanhos 1440, 768, 430 e 390 px; enviar feedback antes de declarar a direção aprovada.”

## Validação e Git

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado, zero erros e dois avisos preexistentes em `eslint.config.mjs` e `postcss.config.mjs`.
- `npm run build`: aprovado com Next.js 15.5.27.
- `npm run cms:seed` em dry-run: aprovado, oito projetos, dez obras e uma configuração; nenhuma escrita remota.
- Browser QA técnico: Home conferida em 1440, 768, 430 e 390 px; sem overflow horizontal. Modal conferido para dez itens, navegação por setas/Escape, links de projetos/galerias e redirects antigos. QA humano ainda pendente.
- `npm audit --omit=dev`: sem vulnerabilidades críticas após patch do Next; ainda relata 11 moderadas e 15 altas na árvore de dependências, incluindo pacotes transitivos do CMS.
- Não houve deploy; o Sanity remoto não foi configurado e nenhum seed foi gravado.
- Branch: `feat/cms-v1-redesign`.
- Deploy: não realizado.
