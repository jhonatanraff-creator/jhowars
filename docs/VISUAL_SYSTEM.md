# Visual system — V1

## Referências aprovadas para esta primeira versão

- Screenshot conceitual fornecido pelo usuário: parede de imagens em colagem, cabeçalho leve e janela de obra.
- PDF de identidade `id.pdf`: wordmark/ícone já existentes, paleta vermelho, amarelo, preto e off-white; tipografia Ondo e lettering de apoio.
- ZIP legado: fonte apenas dos conteúdos e arquivos de imagem, não do layout Adobe Portfolio.

O Figma ainda não foi fornecido. Esta implementação é uma primeira leitura da referência enviada e aguarda QA humano; não é declaração de aprovação final da direção de arte.

## Tokens e aplicação

- Fundo papel: `#f2e8d3`; superfície: `#f8f1e2`.
- Preto: `#11110f`; vermelho: `#e9232e`; amarelo: `#f2bd19`; azul de apoio: `#184b9a`.
- Ondo é a família tipográfica principal, já presente em `public/fonts`; TwinMarker fica para usos pontuais.
- Marca usa um logo PNG real do pacote Adobe, sem redesenho ou conversão.
- Composição responsiva em colagem controlada, com presets CSS; não há coordenadas aleatórias.

## Comportamento

- A parede repete o conjunto finito de obras verificadas conforme rolagem, sem colocar a mesma imagem adjacente.
- Clique abre modal com capa, título, descrição já existente, navegação anterior/próxima e link para o projeto.
- Modal fecha por botão, fundo e Escape; setas navegam; Tab fica contido no diálogo e foco retorna ao item aberto.
- `prefers-reduced-motion` reduz transições.
- Em telas pequenas, a composição passa a duas colunas e o modal empilha imagem e detalhes.

## Revisão humana pendente

Conferir equilíbrio e recortes da colagem, leitura da marca, navegação do modal e espaçamentos nos viewports de 1440, 768, 430 e 390 px. Não substituir a composição por cards genéricos sem direção explícita.
