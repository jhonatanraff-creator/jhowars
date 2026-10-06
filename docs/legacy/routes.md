# Mapa de URLs antigas para a V1

| URL ANTIGA | TIPO | CONTEÚDO | STATUS NOVA URL |
|---|---|---|---|
| `https://jhowars.com/bestas-do-dia-brazilian-wildlife` | Projeto | BESTAS DO DIA - Brazilian Wildlife. | `/projetos/bestas-do-dia-brazilian-wildlife` |
| `https://jhowars.com/bumba-meu-boi` | Projeto | BUMBA MEU BOI. | `/projetos/bumba-meu-boi` |
| `https://jhowars.com/contact` | Sobre | HTML Sobre; canonical antigo apontava para /contact. | `/sobre` |
| `https://jhowars.com/contato` | Contato | Página Contato. | `/sobre` |
| `https://jhowars.com/corpos-graficos` | Projeto no arquivo | Corpos Gráficos; sem HTML detalhado. | `/projetos/corpos-graficos` |
| `https://jhowars.com/countenance-illustration` | Projeto | Countenance - Selection of illustrations. | `/projetos/countenance-illustration` |
| `https://jhowars.com/fogo-fossil` | Projeto | FOGO FÓSSIL - Selection of illustrations. | `/projetos/fogo-fossil` |
| `https://jhowars.com/o-que-fica-project-editorial` | Editorial | O Que Fica - Project Editorial. | `/projetos/o-que-fica-project-editorial` |
| `https://jhowars.com/posters-2024-experimental-print-and-illustration` | Projeto no arquivo | Posters 2024; sem HTML detalhado. | `/projetos/posters-2024-experimental-print-and-illustration` |
| `https://jhowars.com/veja-saude-editorial-illustration` | Editorial | VEJA SAÚDE — Editorial Illustration. | `/projetos/veja-saude-editorial-illustration` |
| `https://jhowars.com/work` | Work / arquivo | Página de arquivo/cartões de projetos. | `/projetos` |

## Implementação de redirects

`next.config.ts` redireciona `/work`, `/work/:slug`, `/about`, `/contact` e `/contato`. Os slugs de projeto usam os destinos listados acima em `/projetos/[slug]`.

Os dois projetos que só tinham cartões no arquivo receberam apenas seus cartões e capas; não foi criada descrição editorial para eles.

## Links externos encontrados

| URL | Tipo |
|---|---|
| `https://www.behance.net/Jhonatanraff` | Externo |
| `https://www.instagram.com/jhow.ars/` | Externo |
| `https://www.linkedin.com/in/jhonatanrafaelars` | Externo |
| `mailto:jhow@jhowars.com` | E-mail |
