# Auditoria de qualidade das imagens de projetos

Auditoria realizada em 2026-10-07. O dataset consultado foi Sanity `frut5d17/production`. A auditoria foi somente de leitura; nenhum asset ou documento foi gravado.

## Resultado

- 8 projetos consultados; 234 referências de imagem nos blocos editoriais; 221 IDs de asset Sanity distintos.
- 231 referências foram cruzadas com IDs e URLs no inventário legado. Nenhuma referência cruzada aponta para uma imagem Sanity menor que a largura máxima registrada no inventário de origem.
- Os cinco ZIPs fornecidos contêm 78 cópias de arquivos de imagem. Há 10 nomes únicos com pelo menos 800 px em uma dimensão; os demais são, em sua maioria, placeholders de 32 × 42/43 px. Os placeholders não estão sendo usados nos blocos de projeto consultados.
- Foram comparados SHA-256 e dimensões de cinco arquivos locais de alta resolução com seus assets Sanity correspondentes. Dois pares são byte a byte iguais. Os outros três têm as mesmas dimensões, mas bytes diferentes. Não há uma variante local de maior dimensão para esses cinco arquivos.
- Nenhuma imagem foi enviada, trocada ou removida. A auditoria não encontrou uma versão maior disponível para as imagens abaixo.

## Imagens full-width limitadas pela fonte

As larguras abaixo são as dimensões nativas dos assets Sanity, não as dimensões transformadas pelo Next.js. Os blocos ocupam toda a largura editorial. A página limita o conteúdo a 1500 px; em telas HiDPI, essas fontes entregam menos pixels que o ideal de 1600–2000 px para uma imagem com cerca de 900 px CSS.

| Projeto | Posição no array `contentBlocks` (começa em 0) | Arquivo legado | Dimensão nativa | Verificação da fonte maior |
|---|---:|---|---:|---|
| BESTAS DO DIA | 0 | `635d16ae-65a5-4acf-9fcb-bbe57ea6ad0e_rw_1920.png` | 1448 × 1086 | O ZIP contém o mesmo arquivo e SHA-256; o CDN legado entrega os mesmos 1448 × 1086 px. Sem versão maior identificada. |
| Countenance | 0 | `78fa029f-af65-4956-87a5-9084e168520b_rw_1920.jpg` | 1400 × 477 | O ZIP contém o arquivo de 1400 × 477 px; o inventário lista variantes até 1400 px. Sem versão maior identificada. |
| Countenance | 18 | `610b0814-f623-453b-afec-7f437d0140fb_rw_1920.jpg` | 1448 × 2048 | O inventário legado lista srcset até 1448w e não registra cópia local. Sem versão maior identificada. |
| VEJA SAÚDE | 18 | `84edd740-1655-43d2-8e18-8b0107792fbc_rw_1920.png` | 1448 × 1086 | O inventário legado lista srcset até 1448w e não registra cópia local. Sem versão maior identificada. |

O sufixo `_rw_1920` não garante 1920 px reais: o asset BESTAS DO DIA acima tem esse nome, mas tanto o ZIP quanto o CDN fornecem 1448 px de largura. Em Countenance e VEJA SAÚDE, o inventário de srcset confirma o limite de 1400/1448 px. Nenhum upscale foi aplicado.

## Causa e ajuste de entrega

As consultas do site já apontavam para o URL original do asset Sanity; não havia parâmetro de `width` que limitasse permanentemente todos os assets a 400, 600, 800 ou 1200 px. O problema da entrega era a combinação de `sizes` genérico para layouts diferentes e qualidade padrão do otimizador do Next. O browser podia escolher uma transformação que não refletia as colunas reais, enquanto ilustrações com texturas finas eram entregues com qualidade padrão.

Agora os blocos editoriais compartilham `projectImageSizes()` e informam tamanhos correspondentes a largura e número de colunas. Os blocos usam `quality={90}`. O índice usa largura de coluna real, as imagens lado a lado dividem o espaço do grupo e galerias calculam o tamanho pelo número de colunas. A geração `srcset` é feita pelo `next/image`; a configuração do Next conserva larguras de dispositivo que chegam a 3840 px. O otimizador não cria informação além da dimensão nativa do asset.

O lightbox usa diretamente o URL original do asset Sanity, sem thumbnail nem limite arbitrário de 1200 px. Nenhum `blur`, upscale, sharpening ou processamento por IA foi usado.

## Registros para a rodada

- Ativos substituídos no Sanity: 0. Não foi encontrada uma fonte real com resolução maior que a versão atual.
- Novos uploads: 0. Duplicatas adicionadas: 0.
- Assets locais comparados por hash: 5. Correspondências byte a byte: 2; dimensões iguais com bytes diferentes: 3.
- Fontes que continuam abaixo do alvo HiDPI para blocos largos: as quatro linhas da tabela acima. Motivo: o ZIP ou o srcset/CDN legado não apresenta resolução maior.
- Para repetir a comparação dos assets referenciados no dataset, rode `npm run sanity:project-image-audit -- --dry-run`. A ferramenta consulta apenas metadados, não imprime segredos e não altera documentos.
