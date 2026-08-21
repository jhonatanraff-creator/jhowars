# Jhow.Ars — Portfólio

Portfólio responsivo e editorial para **Jhow.Ars**, construído com Next.js, TypeScript, Tailwind CSS e App Router. Os projetos são estáticos, sem CMS ou banco de dados, e podem ser atualizados em um único arquivo.

## Requisitos

- Node.js 20.9 ou superior
- npm 10 ou superior

## Instalação e execução

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev    # servidor de desenvolvimento
npm run lint   # análise estática
npm run build  # build otimizado de produção
npm run start  # executa o build de produção
```

## Como adicionar um projeto

1. Adicione as imagens em `public/art/`.
2. Abra `data/projects.ts`.
3. Inclua um novo objeto no array `projects`, seguindo o tipo `Project`.

O slug define a URL (`/work/meu-projeto`). A listagem, página individual, metadata e navegação para o próximo projeto são geradas automaticamente. Para trocar os placeholders, mantenha os mesmos nomes de arquivo ou atualize `cover` e `images` no objeto do projeto.

Os campos opcionais `orientation` (`landscape`, `portrait` ou `square`) e `layout` (`wide`, `offset`, `compact` ou `tall`) controlam o ritmo editorial sem exigir alterações nos componentes. `featured` define se o projeto aparece na seleção da Home.

## Estrutura

```text
app/                 Rotas, layouts, estilos e metadata
components/          Componentes compartilhados
data/projects.ts     Fonte única dos projetos
public/art/           Imagens e placeholders das obras
```

## Conteúdo provisório

Textos, contatos e imagens desta primeira versão são placeholders editoriais e devem ser revisados antes da publicação.
