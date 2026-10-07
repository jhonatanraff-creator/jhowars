# CMS Jhow.ars

Sanity é a fonte de verdade do conteúdo. Os documentos existentes continuam com os mesmos IDs; os dados de idioma são campos PT/EN dentro de cada documento.

## Acesso

Abra `/studio` no endereço do site e entre com a conta autorizada no projeto Sanity `frut5d17`, dataset `production`. A aplicação precisa das variáveis de ambiente Sanity já configuradas para consultar o conteúdo. Não coloque tokens no repositório.

## Home posts

Em **HOME → Publicações da Home**:

- `Ativa na Home` controla a presença no conjunto da Home.
- `Imagem da Home` é independente da capa do projeto; `Imagem para mobile` é opcional.
- `Orientação` descreve a imagem sem alterar sua proporção; `Presença visual` orienta o peso relativo na composição.
- `Obra relacionada` e `Projeto relacionado` são referências opcionais.
- `Imagens deste modal` é a galeria daquele post.
- Preencha `COR DO FUNDO NO HOVER` e `COR DO TEXTO NO HOVER` com uma das opções da paleta. Esses valores controlam somente o hover daquele post.
- Para uma cor fora da paleta, escolha `Custom` e informe hexadecimal no formato `#RRGGBB` no campo exibido.
- Os campos textuais localizados aparecem divididos em **Português** e **English**. O front usa o idioma da rota e recua para Português se o idioma pedido estiver vazio.

## CURADORIA DA HOME

`Artwork` representa uma obra; `HomePost` representa uma fotografia específica usada no stream. Fotografias diferentes da mesma obra ficam em HomePosts separados, mas apontam para o mesmo Artwork. Para adicionar outra fotografia, cadastre um HomePost com seu próprio asset, alt text e orientação e relacione a obra existente.

No HomePost, `orientation` informa portrait, landscape, square ou auto; `sizeHint` define presença relativa; `weight` controla frequência na seleção aleatória. `hoverBackgroundColor`/`hoverBackgroundCustom` e `hoverTextColor` guardam as cores escolhidas por publicação. `modalGallery` é a sequência de imagens daquele modal; cada HomePost do mesmo grupo pode abrir a galeria compartilhada. Use `Project relation` somente quando a publicação deve oferecer o CTA para um projeto. `enabled` inclui ou remove o HomePost do stream sem apagar o documento.

O inventário canônico da primeira curadoria está em `data/home-curation-01.json`. O importador `sanity:home-curation-01` usa os arquivos originais PNG indicados no manifesto, faz upload sem redimensionar e relaciona cada publicação à sua obra quando especificado. Grupos de galeria compartilham a sequência indicada no manifesto. O modo padrão é somente leitura:

```powershell
npm run sanity:home-curation-01 -- --dry-run
```

Revise nomes, assets, relações e contagens antes de gravar. A carga de produção requer confirmação explícita:

```powershell
$env:HOME_CURATION_01_CONFIRM='YES'
npm run sanity:home-curation-01 -- --commit --allow-production
```

O importador usa SHA-1 para reconhecer assets já armazenados no Sanity e SHA-256 para detectar arquivos locais idênticos. Uma reexecução atualiza os documentos identificados por slug/nome/hash do asset, reutiliza assets e não cria uma segunda cópia. A pasta de origem pode ser substituída por `JHOW_HOME_CURATION_DIR`.

## SHOP VISIBILITY

`shopEnabled` em **SITE → Configurações** é a fonte de verdade para visibilidade pública. Com `false`, Shop some do Header e do menu mobile, `/shop` e `/en/shop` retornam 404 e a metadata aplica `noindex`. Os ShopItems, schema, rota e integração permanecem cadastrados. Para reabrir, altere o campo para `true` no Sanity; não é preciso mudar código.

## Obras

Em **OBRAS → Todas as obras**, edite título, descrição, técnica, edição e texto alternativo em Português e English. Ano, dimensões, status, imagens, slug e referências são dados compartilhados. Adicione, remova e reordene imagens no array; `Capa` seleciona a imagem de destaque. Relacione a obra ao projeto quando for confirmado.

## Projetos

Em **PROJETOS → Página Projetos**, edite a identificação acima do título e o título em Português e English. A introdução é opcional e pode ficar vazia.

Em **PROJETOS → Todos os projetos**, mantenha o slug técnico, ano, capa e relações. Título, categoria, resumo, cliente, créditos e texto dos blocos possuem idiomas separados. Os blocos de conteúdo podem ser editados e reordenados no array. Imagens e arquivos de mídia permanecem compartilhados entre idiomas; alt e legendas são localizados.

Na lista de projetos, `Capa` controla a imagem do índice. O índice usa primeiro o `Ano` mais recente e, em caso de empate, `Ordem no arquivo` crescente. `Mostrar no índice de Projetos` oculta o item do índice sem apagar o documento nem sua página interna. `Categoria antiga (migração)` permanece no documento como histórico; use `Categorias` para alimentar os filtros.

### Categorias

- Em **PROJETOS → Categorias**, crie uma categoria com nomes PT e EN, slug estável, ordem e estado ativo.
- Em **PROJETOS → Todos os projetos**, associe uma ou mais categorias pelo campo `Categorias`. Categorias sem projeto visível não aparecem no site.
- Para mudar os rótulos, edite Português e English no mesmo documento. O projeto mantém uma única referência para os dois idiomas.
- `Ordem nos filtros` controla a ordem da lista de filtros. Desativar uma categoria oculta o filtro sem apagar a categoria ou os projetos.
- A migração inicial usa os valores existentes em `Categoria antiga (migração)`. O script preserva esse campo, é idempotente e roda em dry-run por padrão:

```powershell
npm run sanity:project-categories -- --dry-run
```

Depois de revisar as categorias e os projetos que receberão referências, a gravação exige confirmação explícita:

```powershell
$env:PROJECT_CATEGORIES_CONFIRM='YES'
npm run sanity:project-categories -- --commit --allow-production
```

### Imagens e recomendações

- Em cada bloco de imagem, edite o asset, o texto alternativo e a legenda no CMS. A ordem e as opções do bloco permanecem no próprio array `Conteúdo do projeto`.
- O site usa `next/image` com tamanhos responsivos por largura/colunas e qualidade 90. A janela ampliada usa a URL original do asset Sanity para preservar a resolução disponível.
- Use **Outros projetos (até 3)** para editar os relacionados. Eles aparecem na sequência de referências do CMS. O link **Ver todos os projetos →** leva ao arquivo no idioma atual.

### Páginas individuais e sequência editorial

- `Apresentação do conteúdo = Sequência editorial` faz a página usar somente a ordem de `contentBlocks`, sem inserir antes uma capa e um título genéricos. `Padrão do site` mantém a estrutura comum.
- Em `Conteúdo do projeto`, arraste os blocos para reordená-los. A ordem do array é a ordem da página em PT e EN.
- Em **Texto**, edite `Título (opcional)` e `Texto` nos campos Português e English. `Largura do texto`, `Alinhamento`, `Espaço antes` e `Espaço depois` são opções controladas.
- Em **Imagem**, use `Imagem`, alt/legenda localizados e as opções de largura, alinhamento e espaçamento. A proporção original do asset é preservada.
- Em **Galeria / coleção de mídia**, as imagens são um único grupo: arraste para reordenar internamente. `Composição`, colunas desktop/tablet/mobile, espaço, largura e alinhamento controlam o agrupamento. Para remover, apague o item no array de imagens; para adicionar, use o final do array.
- Em **Duas imagens**, cada lado tem sua imagem, alt e legenda; em telas estreitas elas empilham.
- Em **Mídia (GIF/vídeo)**, escolha um arquivo ou informe a URL externa disponível. O bloco permanece na posição do array. Confira URLs assinadas antes de depender delas por longo prazo.
- Use **Outros projetos (até 3)** para escolher recomendações manuais. Não selecione o próprio projeto. Se o array ficar vazio, o site usa até três projetos visíveis pela ordem do arquivo.

O script específico de sequência não recria documentos, não apaga assets e não faz upload de cópias. O modo padrão é somente leitura:

```powershell
npm run sanity:project-layouts -- --dry-run
```

Após revisar o relatório e confirmar que todos os assets estão resolvidos, a gravação requer confirmação explícita:

```powershell
$env:SANITY_PROJECT_LAYOUT_MIGRATION_CONFIRM='YES'
npm run sanity:project-layouts -- --commit --allow-production
```

O script grava apenas `contentBlocks`, `contentLayout`, `relatedProjects` e o fingerprint da migração nos cinco projetos mapeados. Fingerprints já existentes diferentes são preservados para revisão manual.

## Shop

Em **SHOP**, cadastre somente produtos confirmados. Título, descrição, técnica, edição e alt possuem PT/EN. Fotos, preço, disponibilidade, dimensões e URL Ramona são campos próprios do produto. Disponibilidade seleciona as listas **Disponíveis**, **Esgotados** e **Em breve**. Não há checkout integrado.

## Sobre

Em **SOBRE · Página Sobre**, edite os títulos de apresentação e circulação, introdução, bio e descrições em Português e English. Use **Mídia principal (imagem ou GIF)** para trocar o arquivo ao lado da apresentação; o campo Retrato existente continua disponível. Os textos alternativos da mídia são localizados.

Na página, o primeiro parágrafo da apresentação fica em **Introdução**; os parágrafos complementares ficam em **Biografia**. A migração preserva o texto original ao separar esses campos.

Os eventos em **Circulação** aparecem na mesma ordem do array do CMS. Adicione ou remova itens pelo array; use arrastar e soltar para reordenar. Nome, organização, cidade, estado, anos e link são compartilhados; descrição é localizada.

## Site

Em **SITE · Configurações**, e-mail e redes são globais. O e-mail é usado nos links `mailto:` do Header e do Footer. Subtítulo, localização, mensagem de disponibilidade e SEO têm versões PT/EN. A imagem Open Graph padrão é compartilhada.

## Migração e verificação

A migração de idioma é aditiva, usa os documentos atuais e não remove IDs, assets ou referências. Confira o plano sem gravar:

```powershell
npm run sanity:i18n-migrate -- --dry-run
```

Depois da revisão, a migração real exige confirmação explícita e a flag de produção:

```powershell
$env:I18N_MIGRATION_CONFIRM='YES'
npm run sanity:i18n-migrate -- --commit --allow-production
```

Para checar documentos, pares de idioma e referências:

```powershell
npm run sanity:i18n-verify
```

O seed legado é separado. Sempre rode `npm run sanity:seed -- --dry-run` antes de qualquer carga de conteúdo. Seeds não substituem documentos editados e não removem conteúdo.
