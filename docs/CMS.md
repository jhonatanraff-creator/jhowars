# CMS Jhow.ars

O Sanity é a fonte final do conteúdo. A aplicação mantém um fallback centralizado em `lib/portfolio.ts` durante o desenvolvimento sem credenciais; componentes não consultam Sanity diretamente.

## Acesso e configuração

1. Crie ou selecione o projeto Sanity e o dataset que receberá o conteúdo.
2. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` e `NEXT_PUBLIC_SANITY_API_VERSION`.
3. Abra `/studio` no site. Com o ID do projeto configurado, a rota carrega o Sanity Studio incorporado.
4. Para migrar os documentos e os arquivos de mídia, crie um token com permissão de escrita e configure `SANITY_API_TOKEN` localmente. Não versione esse token.

O repositório não contém credenciais ou um projeto Sanity configurado. Portanto, a preparação e a prévia local do seed estão prontas, mas a gravação remota e a validação autenticada do Studio dependem da configuração acima.

## Rodar a migração

O seed lê `docs/legacy/content.md`, `docs/legacy/assets.md`, `data/legacy-modules.json` e as cópias de capas já verificadas em `public/legacy/`. Para os demais arquivos, usa a URL de maior resolução identificada pela auditoria. Ele não altera o código da interface.

```powershell
npm run sanity:seed -- --dry-run
```

Para gravar após conferir a prévia, configure `SANITY_SEED_CONFIRM=YES` junto do token e execute:

```powershell
npm run sanity:seed -- --commit
```

O dataset `production` também exige `--allow-production`. O seed usa IDs determinísticos; consulta o hash SHA-256 dos assets e reaproveita arquivos idênticos; cria documentos ausentes; atualiza documentos já marcados pelo seed somente quando ainda não foram editados; e completa campos ausentes nos IDs da migração V1 com `setIfMissing`. Registros sem identificação de migração e conteúdo alterado são preservados. Nenhum documento ou asset é apagado.

Execute o `--dry-run` sempre antes da gravação. Para verificar idempotência remota, execute o comando `--commit` novamente: documentos iguais serão ignorados, IDs permanecerão únicos, e arquivos binariamente iguais serão reutilizados.

## Studio

- **HOME → Publicações da Home:** lista de HomePosts.
- **OBRAS → Todas as obras:** ordenação por título ou ano.
- **PROJETOS → Todos os projetos:** ordenação por ano decrescente ou título.
- **SHOP → Todos / Disponíveis / Esgotados / Em breve:** listas filtradas por disponibilidade.
- **SOBRE · Página Sobre:** singleton `about-page`.
- **SITE · Configurações:** singleton `site-settings`.

Home e Shop não têm uma ordem fixa atribuída pelo seed. Os HomePosts têm `weight` vazio; quando esse campo for usado, ele indica frequência relativa na seleção aleatória, não ordenação.

## HOME

1. Em **HOME → Publicações da Home**, crie uma publicação.
2. Preencha o nome interno e escolha a imagem principal. Ela é independente da capa do projeto.
3. Use `Imagem para mobile` se houver uma composição diferente para telas menores.
4. Selecione orientação. `auto` detecta/entrega o controle ao layout; retrato, paisagem e quadrado informam o formato sem recortar ou deformar o arquivo.
5. Use presença visual para indicar `auto`, pequena, média, grande ou hero. A composição final continua automática.
6. Marque `Ativa na Home` para incluí-la na seleção aleatória.
7. Opcionalmente relacione uma Artwork e/ou Project.
8. Preencha os dados do modal. Em `Imagens deste modal`, adicione, remova e reordene somente as imagens da mesma publicação/obra. A navegação futura do modal não deve misturar posts diferentes.

## OBRAS

Em **OBRAS → Todas as obras**, crie ou edite título, slug, ano, técnica, dimensões, edição, descrição, categorias e status. Na lista de imagens, adicione, remova e arraste para reordenar. Defina a capa e relacione um projeto. Os registros migrados representam imagens identificadas pelo material antigo; as notas indicam quando o legado não fornece um título individual.

## PROJETOS

Em **PROJETOS → Todos os projetos**, edite título, slug, ano, categoria, capa, resumo, cliente, créditos, URL antiga, obras relacionadas e blocos de conteúdo.

Use `+` em **Conteúdo do projeto** para adicionar texto, imagem, galeria, duas imagens, imagem em largura total, GIF/vídeo, legenda ou espaçador. Cada galeria aceita adicionar, remover e reordenar imagens. Use legenda e texto alternativo quando houver informação aprovada. Reordene blocos arrastando-os.

O seed preserva a ordem visual dos módulos de mídia extraídos do HTML. A copy textual integral é mantida em um bloco por projeto; quando o inventário mestre não permite associar cada parágrafo ao módulo visual individual, a migração não inventa esse pareamento.

## SHOP

O legado auditado não confirma produtos, preço, estado de venda ou URL da Ramona. Por isso, o seed não cria produtos de exemplo. Em **SHOP → Todos os produtos**, crie um ShopItem real, adicione fotos próprias do produto, descrição, técnica, dimensões, edição e preço; defina disponibilidade e, se disponível, URL da Ramona. A ausência da URL gera um aviso, não bloqueia a preparação. ShopItem pode se relacionar com Artwork, mas continua sendo um registro de produto distinto.

## SOBRE

Edite a biografia completa, retrato, circulação, clientes, imprensa e seções adicionais em **SOBRE · Página Sobre**. A migração deixa retrato, clientes e imprensa vazios quando o legado não os confirma. Anos/cidades de circulação também ficam vazios quando não identificados.

## SITE

Edite nome artístico, subtítulo, e-mail, Instagram, Behance, LinkedIn, título e descrição SEO e imagem Open Graph padrão em **SITE · Configurações**. A imagem Open Graph permanece vazia até selecionar um asset real.

## Data layer

`lib/portfolio.ts` expõe `getHomePosts()`, `getArtworks()`, `getProjects()`, `getProjectBySlug(slug)`, `getShopItems()`, `getAboutPage()` e `getSiteSettings()`. Essas funções centralizam GROQ, resolução de referências, adapters compatíveis com a implementação V1 e fallbacks de desenvolvimento.

## Arquivos de migração

- `scripts/seed-sanity.mjs`: seed repetível com prévia e confirmação para escrita.
- `data/legacy-modules.json`: ordem dos módulos e IDs de mídia detectados nos HTMLs salvos.
- `docs/legacy/`: fonte editorial e inventários usados na migração.
- `docs/CMS_MIGRATION_REPORT.md`: cobertura, dados incompletos e limitações verificadas nesta rodada.
