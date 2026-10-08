# Home V2 — direção de arte

## Diagnóstico anterior

- Palco branco com peças pequenas e distribuição pouco hierárquica.
- Ausência de intervenções gráficas entre as obras.
- Barra de controles e footer global ocupavam duas faixas inferiores.
- Etiquetas eram texto simples, sem relação material com a composição.
- O rearranjo usava deslocamentos trigonométricos sem composições alternativas explícitas.

## Sistema atual

A revisão é limitada a `/home-v2` e `/en/home-v2`. As variáveis `--v2-*` no módulo CSS definem papel, tinta, acento, linha, foco e curva de movimento. O cabeçalho global recebe ajustes apenas quando a V2 está aberta; o footer global é oculto apenas nessas rotas. Os controles de progresso, curadoria e navegação ocupam uma única faixa inferior.

Cada cena recebe SVGs vetoriais inline autorais de sol irregular, pincelada, linha azul, pontos vermelhos e folha abstrata. Os conjuntos alternam posições a cada três cenas. São decorativos, não capturam eventos e não contêm texto.

Os presets de obras usam proporções da imagem real, orientação e `sizeHint` do HomePost. A cena tem quatro posições editoriais e dois presets alternativos determinísticos para Reorganizar. Restaurar recupera o preset inicial e os deslocamentos manuais. Mobile usa o mesmo conteúdo em fluxo vertical e posiciona menos grafismos por cena.

Os dados continuam a vir de `getHomePosts(locale)`, com os relacionamentos de Artwork e Project já existentes. Nenhum documento ou schema do Sanity foi alterado.
