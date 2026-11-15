# Fuentes del agente (actualizado el 14/11/2026)

Lista cerrada: el agente solo guarda noticias de estas fuentes. Todo resultado de otro dominio se descarta,
salvo que mencione uno de los foros de la segunda tabla. Cuotas por corrida según el horizonte de la fuente:
14 de corto, 10 de mediano y 10 de largo plazo (máximo 34), con tope de 4 por fuente. Solo pasan noticias que
nombran algo de los 4 temas (pagos instantáneos, open finance, stablecoins, IA aplicada) en español, inglés o portugués.

## Medios y organismos (13)

| Fuente | Horizonte sugerido | Cómo se lee | URL |
|---|---|---|---|
| iProUP Finanzas | corto | RSS | https://www.iproup.com/rss/finanzas |
| Fintech News Américas (LatAm) | corto | RSS | https://fintechnews.am/feed/ |
| Fintech News Global (Suiza) | corto | RSS | https://www.fintechnews.ch/feed/ |
| Bloomberg Línea (general, se filtra por palabras clave) | corto | RSS | https://www.bloomberglinea.com/arc/outboundfeeds/rss/?outputType=xml |
| LatamList | corto | RSS | https://latamlist.com/feed/ |
| Finsiders Brasil | corto | RSS | https://finsidersbrasil.com.br/feed/ |
| Cámara Argentina de Fintech | corto | RSS | https://camarafintech.org/feed/ |
| Finnovista | mediano | RSS | https://www.finnovista.com/feed/ |
| a16z Fintech | mediano | Búsqueda web | site:a16z.com fintech |
| BIS (publicaciones FSI) | largo | RSS | https://www.bis.org/doclist/bis_fsi_publs.rss |
| BIS Innovation Hub | largo | Búsqueda web | site:bis.org innovation hub |
| WEF Future of Financial Services | largo | Búsqueda web | site:weforum.org financial services |
| arXiv | largo | API | https://export.arxiv.org/api/query |

## Foros y eventos (8, de `Fuentes.md`)

Se leen con 4 consultas al RSS de Google Noticias (gratis, sin clave): una por horizonte más una para WEF.
Una noticia cuenta como del foro si su título o resumen lo nombra. Nota: los términos de Google permiten ese feed
solo para uso personal y no comercial.

Costo por corrida: los feeds RSS no cuestan nada. La IA (Groq, `openai/gpt-oss-120b`) clasifica de a 12 noticias
por llamada con una ficha corta (la cita sale del título y proveedores, inversión e indicadores se piden una sola vez
por tema) y resume los 4 temas de a uno, con 30 s de espera antes de cada llamada (un ciclo "Un tema a la vez").

| Foro | Horizonte |
|---|---|
| Argentina Fintech Forum | corto |
| FEBRABAN TECH | corto |
| Money20/20 (USA y Europe) | corto |
| Fintech Americas | corto |
| Point Zero Forum | mediano |
| Sibos | mediano |
| Eurofi (con EBA) | mediano |
| Singapore FinTech Festival | largo |

Quedaron afuera por ahora: Fintech Argentina Summit / FinteChile, FINNOSUMMIT, Fintech Iberoamérica Summit,
CLAB, Foro Latinoamericano de Inclusión Financiera, Fintech & Open Finance Brasil Conference, BID, CEMLA,
BIS Innovation Summit (lo cubre BIS), WEF Annual Meeting (lo cubre WEF) y Gartner.

## Uso de créditos
(se completa después de la primera corrida real con esta lista)
