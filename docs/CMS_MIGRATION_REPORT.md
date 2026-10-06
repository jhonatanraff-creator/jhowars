# Relatório da base e migração do CMS

## Escopo executado

Esta rodada prepara modelos, Studio, data layer e seed. A interface do site não foi redesenhada nem conectada a novos componentes. O seed foi validado em dry-run; nenhum documento ou arquivo foi gravado remotamente.

## Registros planejados pelo seed

| Tipo | Quantidade | Origem / observação |
|---|---:|---|
| HomePosts | 8 | Capas legadas identificadas; imagem de Home independente do projeto; orientação detectada pelas dimensões reais locais. |
| Artworks | 10 | 8 capas dos projetos e 2 imagens secundárias confirmadas para Posters 2024 e Countenance. Títulos usam o título legado do projeto, com nota explícita quando o material não identifica um nome individual. |
| Projects | 8 | Todos os projetos do inventário; 6 com páginas detalhadas e 2 somente com cartões. |
| ShopItems | 0 | O site antigo não confirma produtos, preço, disponibilidade ou URL Ramona. Nenhum produto fictício foi criado. |
| AboutPage | 1 | Bio PT integral, 8 registros de circulação confirmados, base e textos legados de contato/informações adicionais. Retrato, clientes e imprensa vazios por falta de identificação confiável. |
| SiteSettings | 1 | Nome, subtítulo, e-mail, redes e metadados SEO legados. Imagem OG permanece sem valor. |

## Conteúdo e mídia

- O arquivo de ordem `data/legacy-modules.json` registra os módulos e IDs encontrados nas seis páginas detalhadas. O seed mantém a sequência das imagens/galerias; a copy integral de cada projeto fica em um bloco textual. Quando o inventário mestre não associa um parágrafo a um módulo específico, o seed não inventa essa associação.
- Foram identificadas 189 entradas de blocos nos seis projetos detalhados na prévia atual. Os dois cartões sem página detalhada recebem capa e os dados confirmados no inventário, sem conteúdo editorial inventado.
- Prévia do seed: 237 IDs de mídia únicos referenciados (236 imagens estáticas e 1 GIF), sendo 10 arquivos que já estão em `public/legacy/` e 227 URLs do CDN indicadas na auditoria. O seed escolhe a maior resolução registrada.
- Uploads efetuados nesta rodada: 0 imagens e 0 GIFs, pois não há projeto/token Sanity configurado. A quantidade acima é o inventário que o seed tentará associar/uploadar ao executar `--commit`.
- As 8 orientações Home foram calculadas dos arquivos de capa locais: 5 paisagem e 3 retrato. `sizeHint` fica `auto`; nenhum `weight` foi atribuído.
- Os logos permanecem separados em `public/legacy/brand/`; não viram Artwork nem HomePost.
- A auditoria identificou 109 ocorrências locais duplicadas. O seed colapsa referências repetidas pelo ID e, na gravação, compara SHA-256 para reutilizar conteúdo binário igual. Uploads duplicados evitados nesta rodada: 0 (não houve escrita). O dry-run não baixa o acervo inteiro, então deduplicação binária entre IDs CDN ainda não foi medida.
- Uma URL de imagem do CDN respondeu HTTP 200 na verificação de conectividade. As demais URLs ainda precisam ser buscadas na gravação; se alguma estiver inacessível, o seed a lista como ausente e continua sem criar referência quebrada.
- O vídeo Adobe de O Que Fica é preservado como URL externa. O inventário registra URL assinada com expiração; pode ser necessário atualizar esse link se o CDN rejeitá-lo no momento do seed.
- Os dois textos identificados pela auditoria como possíveis notas internas da VEJA foram excluídos dos blocos e estão registrados aqui para revisão: “Essa versão comunica cliente + edição + temas + problema editorial + sua solução visual sem virar textão.” e “Esse texto funciona bem no ponto em que você sai das artes isoladas e começa a mostrar as páginas e duplas.”

## Projetos que precisam de revisão de conteúdo

- **Corpos Gráficos:** o legado fornece apenas um cartão/capa; ano, tipo, descrição e página detalhada não foram identificados.
- **Posters 2024:** somente cartão/capa e segunda imagem foram identificados; não há descrição de projeto.
- **O Que Fica:** a fonte identifica ano como não identificado, trecho PT truncado e vídeo externo com URL assinada.
- **Countenance:** a documentação contém trechos em inglês e trechos com idioma não identificado; não houve tradução nem normalização.
- **VEJA SAÚDE:** duas notas de trabalho aparentemente publicadas foram sinalizadas e removidas do texto migrado.

Shop está sem itens até que produtos reais sejam fornecidos. About não tem retrato identificado; SiteSettings não tem imagem OG identificada.

## Seed e proteção de dados

- `npm run sanity:seed -- --dry-run` foi executado com sucesso. A prévia pode ser repetida sem escrita.
- `--commit` exige projeto/dataset, `SANITY_API_TOKEN` e `SANITY_SEED_CONFIRM=YES`; `production` também exige `--allow-production`.
- Documentos novos usam IDs determinísticos. Documentos marcados pelo próprio seed só são atualizados se não foram editados. IDs conhecidos do seed anterior são completados com `setIfMissing`; campos já existentes não são substituídos. Outros documentos sem marca de migração são ignorados. Nada é apagado.
- O dry-run foi executado repetidamente e passou na validação local de 28 IDs de documento únicos e referências internas (projeto, artwork, HomePost e mídia). Não foi possível provar repetibilidade de mutações remotas, resolver referências dentro de um projeto real ou executar queries contra Sanity: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` e `SANITY_API_TOKEN` não estão configurados neste checkout.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado; Next.js compilou e incluiu a rota `/studio/[[...tool]]`.
- `npm run lint`: não aprovado por erro preexistente em `next-env.d.ts:3` (`@typescript-eslint/triple-slash-reference` para `./.next/types/routes.d.ts`) e dois avisos antigos em `eslint.config.mjs`/`postcss.config.mjs`. Os arquivos alterados nesta rodada passaram no ESLint direcionado.
- HTTP local: `/` e `/studio` responderam 200. Sem Project ID, `/studio` mostra a mensagem de configuração já existente; não é possível afirmar que o Studio autenticado está operacional até conectar um projeto.

## Próximos passos antes do QA de conteúdo

1. Criar/selecionar um projeto e dataset Sanity.
2. Configurar variáveis locais conforme `docs/CMS.md`.
3. Revisar a prévia, então executar o seed com token autorizado.
4. Reexecutar o seed e confirmar que não duplica documentos ou assets.
5. Abrir `/studio`, conferir referências e revisar os projetos incompletos.

Só depois dessa verificação a base poderá ser considerada populada remotamente e pronta para QA de conteúdo.
