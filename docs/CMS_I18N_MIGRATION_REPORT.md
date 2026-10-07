# Relatório da migração CMS + PT/EN

## Execução

- Dataset: `production` do projeto Sanity configurado localmente.
- Dry-run inicial: 28 documentos reconhecidos no plano; nenhum campo com tradução EN confirmada faltante.
- Migração inicial: 28 documentos atualizados com patches protegidos por `_rev`; nenhum documento foi apagado e nenhum ID ou referência foi alterado.
- Durante o QA, foi corrigida a associação do idioma original em campos cujo conteúdo de origem já estava em inglês. Uma segunda passagem atualizou 21 documentos, sem alterar IDs ou referências.
- A última revisão encontrou um parágrafo PT/EN concatenado no conteúdo de BESTAS DO DIA. A extração foi separada e uma migração protegida por `_rev` atualizou apenas esse Project.
- Dry-run final: 28 documentos consultados, **0 documentos no plano**.
- Verificação remota posterior: 8 Projects, 10 Artworks, 8 HomePosts, 1 About, 1 SiteSettings; 243 referências únicas verificadas, todas resolvidas; nenhum ShopItem legado.

## Conteúdo localizado

- Os textos ingleses existentes foram recuperados do inventário legado para seis páginas de projeto com copy em inglês: VEJA SAÚDE, BESTAS DO DIA, BUMBA MEU BOI, FOGO FÓSSIL, O Que Fica e Countenance.
- Conteúdo sem texto correspondente confirmado não foi inventado; dois projetos que eram apenas cartões continuam sem descrição histórica.
- Bio do Sobre, descrições de circulação e seções administrativas sem tradução inglesa no material local receberam tradução fiel para o inglês.
- As duas notas internas sinalizadas de VEJA SAÚDE permanecem excluídas do texto de projeto migrado.
- Um parágrafo de BESTAS DO DIA estava concatenado em PT e EN no inventário histórico; a extração agora separa as versões para seed/migração, mantendo `docs/legacy/content.md` intacto como fonte histórica.
- Slugs, referências de obra/projeto, imagens e demais assets existentes foram preservados.

## Cores de hover da Home

Os oito HomePosts receberam pares iniciais determinísticos da paleta CMS, com contraste inicial preto/branco. O valor foi persistido por documento; o front não depende mais de uma cor por índice quando os campos do CMS estão preenchidos. Esses pares são uma preparação inicial, não uma aprovação de direção de arte.

## Limites

- O script de verificação confirmou as referências do dataset e a presença dos idiomas nos campos principais.
- O inventário não oferece tradução de copy para todos os projetos; onde não havia conteúdo confirmado, os campos permanecem vazios e o fallback de idioma entra em ação.
- A migração não re-enviou nem duplicou imagens ou GIFs.
