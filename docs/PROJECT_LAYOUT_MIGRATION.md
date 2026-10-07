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

**Pendente no Sanity.** O token previamente usado apareceu no diagnóstico de uma chamada de rede e o usuário pediu para mantê-lo. Por segurança, esta rodada não reutiliza essa credencial e ainda não rodou o dry-run remoto, não atualizou os cinco documentos nem validou referências/assets no Studio. Nenhuma gravação foi enviada.

Depois da rotação da credencial, executar primeiro `npm run sanity:project-layouts -- --dry-run`; revisar o número de assets não resolvidos e os cinco documentos. Se houver qualquer asset ausente, interromper e resolver os vínculos antes de gravar. Somente então usar a confirmação explícita descrita em [`CMS.md`](./CMS.md).

## Cobertura da validação

- A validação local TypeScript/lint/build verifica código e schemas; ela não confirma documentos ou referências no Sanity.
- A confirmação visual das cinco rotas em PT/EN e dos breakpoints requer o CMS atualizado. Até a carga segura ser executada, não se declara QA visual concluído.
