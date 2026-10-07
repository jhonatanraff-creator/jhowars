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

## Obras

Em **OBRAS → Todas as obras**, edite título, descrição, técnica, edição e texto alternativo em Português e English. Ano, dimensões, status, imagens, slug e referências são dados compartilhados. Adicione, remova e reordene imagens no array; `Capa` seleciona a imagem de destaque. Relacione a obra ao projeto quando for confirmado.

## Projetos

Em **PROJETOS → Todos os projetos**, mantenha o slug técnico, ano, capa e relações. Título, categoria, resumo, cliente, créditos e texto dos blocos possuem idiomas separados. Os blocos de conteúdo podem ser editados e reordenados no array. Imagens e arquivos de mídia permanecem compartilhados entre idiomas; alt e legendas são localizados.

## Shop

Em **SHOP**, cadastre somente produtos confirmados. Título, descrição, técnica, edição e alt possuem PT/EN. Fotos, preço, disponibilidade, dimensões e URL Ramona são campos próprios do produto. Disponibilidade seleciona as listas **Disponíveis**, **Esgotados** e **Em breve**. Não há checkout integrado.

## Sobre

Em **SOBRE · Página Sobre**, edite introdução, bio, descrições de circulação e seções adicionais em PT/EN. Retrato, nomes próprios, cidades, anos e links são compartilhados.

## Site

Em **SITE · Configurações**, e-mail e redes são globais. Subtítulo, localização, mensagem de disponibilidade e SEO têm versões PT/EN. A imagem Open Graph padrão é compartilhada.

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
