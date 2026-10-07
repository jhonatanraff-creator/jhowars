# Migração das páginas individuais de projeto

## Resultado da leitura local

Foram lidos os cinco ZIPs fornecidos, diretamente dos HTMLs e assets extraídos localmente. Nenhum endereço do site legado foi acessado. O mapa módulo a módulo, com IDs das imagens e textos literais, está em [`PROJECT_LEGACY_LAYOUT_MAP.md`](./PROJECT_LEGACY_LAYOUT_MAP.md).

| Projeto | Módulos no HTML | Blocos CMS previstos | Imagens referenciadas | Collections | Texto localizado | Vídeo |
|---|---:|---:|---:|---:|---|---|
| O Que Fica | 19 | 19 | 15 | 0 | EN; o HTML fornecido não contém uma versão PT equivalente | 1 no módulo 17 |
| Bumba Meu Boi | 15 | 15 | 12 | 0 | 3 blocos PT/EN | 0 |
| Bestas do Dia | 57 | 57 | 48 | 0 | 8 blocos PT/EN e 1 transição literal `...` | 0 |
| Countenance | 24 | 24 | 61 (12 individuais + 49 agrupadas) | 11 | EN; o HTML fornecido não contém uma versão PT equivalente | 0 |
| Fogo Fóssil | 80 | 77 | 65 | 0 | 12 blocos localizados; 3 pares consecutivos EN/PT tornam-se um bloco por posição | 0 |
| **Total** | **195** | **192** | **201 IDs únicos** | **11** | **28 blocos de texto CMS** | **1** |

Os totais distinguem módulos da fonte e imagens dentro de collections. Countenance mantém cada collection como um `galleryBlock` reordenável, sem dividir seus 49 itens em módulos independentes. Os 201 IDs extraídos do HTML são distintos; igualdade binária entre IDs diferentes só pode ser confirmada comparando os hashes dos assets já existentes no dataset.

## Estrutura da migração

- `data/legacy-project-layouts.json` é o mapa normalizado originado dos cinco HTMLs: ordem, grupos, IDs de mídia, traduções e destinos da área “Other projects”.
- `scripts/migrate-legacy-project-layouts.mjs` é específico para esses cinco documentos. O modo padrão é dry-run; ele consulta assets já existentes, não faz upload e bloqueia gravação se faltar um documento ou asset.
- IDs de documentos são preservados. A atualização limitada grava `contentBlocks`, `contentLayout`, referências `relatedProjects` e `legacyLayoutFingerprint` nos documentos existentes.
- O script exige `SANITY_PROJECT_LAYOUT_MIGRATION_CONFIRM=YES`, `--commit` e `--allow-production` para escrever no dataset `production`. Fingerprints diferentes são preservados para não sobrescrever uma execução anterior.
- A URL de player do Adobe encontrada no embed salvo em O Que Fica é preservada como mídia externa se não houver um `sanity.fileAsset` reutilizável. As variantes assinadas HLS/MP4 não são embutidas como permanentes. Não foi feita solicitação ao Adobe.

## Estado real da carga

**Migrado no Sanity `production`.** O dry-run encontrou os cinco documentos esperados e 17 IDs de mídia sem asset correspondente. As URLs `largestSrcset` do CDN foram consultadas; 16 conteúdos binários únicos foram enviados em resolução máxima. Um ID duplicado já foi associado ao mesmo upload durante a carga. Na segunda verificação, mais 12 IDs distintos tinham bytes idênticos a assets já disponíveis; os vínculos foram registrados em `duplicateAssetIds` para impedir novos uploads.

| Projeto | Blocos no CMS | Referências de imagem resolvidas | Relações “outros projetos” |
|---|---:|---:|---:|
| Bestas do Dia | 57 | 48 | 3 |
| Bumba Meu Boi | 15 | 12 | 3 |
| Countenance | 24 | 61 | 3 |
| Fogo Fóssil | 77 | 65 | 3 |
| O Que Fica | 19 | 15 | 3 |
| **Total** | **192** | **201** | **15** |

O bloco de vídeo de O Que Fica usa a URL externa de player preservada do HTML, pois não havia um arquivo de vídeo local reutilizável. As consultas diretas confirmaram `contentLayout: editorial-sequence`, contagem de blocos esperada, 201 referências de asset resolvidas e 15 referências de projetos resolvidas. Uma segunda execução do dry-run retornou `NO-OP (fingerprint igual)` para os cinco projetos, zero uploads pendentes, zero assets não resolvidos e 12 IDs duplicados reutilizados.

## Cobertura da validação

- A validação local TypeScript/lint/build verifica código e schemas; ela não confirma documentos ou referências no Sanity.
- A implementação e os dados já estão disponíveis para QA visual. O QA final das cinco rotas em PT/EN e dos breakpoints ainda não foi concluído; build e resposta HTTP isolada de uma rota não equivalem a aprovação visual.
