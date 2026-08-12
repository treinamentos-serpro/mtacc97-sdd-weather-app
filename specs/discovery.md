# Clima Tempo

## Contexto

`Clima Tempo` é uma aplicação web responsiva que permite aos usuários pesquisar cidades e obter informações meteorológicas imediatas: clima atual e previsão de até 5 dias. A interface será construída em React + Vite, consumindo APIs públicas de geocoding e previsão (ex.: Open-Meteo) sem exigir chave de API. A aplicação deve ser acessível, tratar corretamente estados (loading, erro, vazio) e suportar alternância de unidades de medida.

## Requisitos Funcionais

1. Busca de local
	 - O usuário pode pesquisar por nome de cidade ou localidade.
	 - A aplicação deve oferecer sugestões/autocomplete (via API de geocoding) e permitir selecionar uma sugestão para carregar dados.

2. Clima atual
	 - Ao selecionar uma cidade, a aplicação exibe o clima atual incluindo: temperatura, umidade, precipitação (ou probabilidade), índice UV, velocidade/direção do vento e condição textual/ícone.
	 - Deve mostrar a hora da última atualização dos dados.

3. Previsão de 5 dias
	 - A aplicação apresenta previsão diária (mínima/máxima) para os próximos 5 dias, além de resumo por dia (condição, chance de chuva).

4. Alternância de unidades
	 - Usuário pode alternar entre Celsius/Fahrenheit e km/h ↔ mph; a preferência deve ser aplicada imediatamente e persistida localmente (ex.: localStorage).

5. Estados da aplicação
	 - Implementar e exibir estados: `loading`, `error` (com mensagem amigável) e `empty` (quando não há resultados).

6. Geolocalização opcional
	 - Opcionalmente, o usuário pode permitir uso da geolocalização do navegador para carregar o clima da sua posição atual.

Observação: novos requisitos funcionais podem ser adicionados sob demanda (ex.: favoritos, notificações push, histórico de buscas, modo offline). Indique as funcionalidades desejadas para que sejam formalizadas e priorizadas.

## Requisitos Não-Funcionais

- Responsividade
	- A interface deve ser responsiva e oferecer experiência consistente em mobile e desktop (layout adaptativo, imagens/icones escaláveis).

- Acessibilidade (a11y)
	- Elementos interativos devem ter roles e labels semânticos, foco visível, suporte a navegação por teclado e contraste de cores adequado.

- Desempenho e Robustez
	- Minimizar chamadas desnecessárias às APIs (caching curto das últimas buscas), tratar timeouts/retries e apresentar feedbacks de erro claros.
	- Tempo de resposta objetivo: respostas em cache < 1s; requisições novas < 3s (meta; validar em testes).

- Persistência de Preferências
	- Preferências de usuário (unidades, última cidade pesquisada) devem ser persistidas localmente sem expor dados sensíveis.

- Segurança e Privacidade
	- Não armazenar dados pessoais sem consentimento. Solicitar permissão explícita antes de usar geolocalização e documentar uso de dados.

- Compatibilidade e Manutenibilidade
	- Suportar navegadores modernos (Chrome, Edge, Firefox, Safari). Código modular, com testes unitários e E2E para facilitar manutenção.

## Ambiguidades, Contradições e Perguntas em Aberto

1. Granularidade da busca
	- Ambiguidade: "cidade ou localidade" pode incluir bairros, CEPs, endereços completos ou apenas cidades/municípios.
	- Pergunta: devemos aceitar coordenadas, CEPs e endereços completos além de nomes de cidade? Qual granularidade é necessária para o MVP? 
    - Resposta: Para o MVP, apenas estado, cidade e bairro, sem CEPs, coordenadas dentre outros.

2. Autocomplete / Sugestões
	- Ambiguidade: não há especificação de número máximo de sugestões, comportamento de debounce, nem se os resultados mostrarão país/estado.
	- Proposta: usar debounce ~300ms e mostrar até 5 sugestões com país/estado. Confirmação requerida.

3. Campos obrigatórios do clima atual
	- Ambiguidade: lista de campos (UV, precipitação, umidade, vento) não distingue entre obrigatórios e opcionais.
	- Pergunta: quais campos são obrigatórios para exibir (ex.: temperatura e condição textual) e quais podem ser condicionais conforme disponibilidade do provedor? 
    - Resposta: Exiba sempre todos os campos. Para o que não for retornado, algum aviso como "dados indisponíveis no momento" deve ser exibido ao usuário.

4. Previsão de 5 dias — inclusão do dia corrente e fuso horário
	- Ambiguidade: "a partir do dia corrente" — incluir o dia atual como dia 0? Como tratar fuso horário da localidade (usar horário local da cidade ou UTC)?
	- Proposta: incluir o dia corrente como o primeiro dia e apresentar datas no fuso local da cidade; confirmar se precisamos de breakdown horário. 

5. Alternância de unidades
	- Ambiguidade: escopo da persistência (localStorage apenas no device? sincronização por conta de usuário?) e comportamento padrão.
	- Pergunta: persistência local é suficiente ou haverá autenticação/centralização de preferências? Definir unidade padrão (sugestão: Celsius/km·h).
    - Resposta: persistência local e padrão como Celsius e Km/h.

6. Responsividade e Acessibilidade
	- Ambiguidade: não foi especificado um nível WCAG alvo (ex.: 2.1 AA).
	- Pergunta: devemos seguir WCAG 2.1 AA como requisito mínimo? Recomenda-se sim para o MVP.

7. Geolocalização
	- Ambiguidade: comportamento quando o usuário nega permissão e política de retenção das coordenadas.
	- Proposta: se negada, apresentar a caixa de busca com sugestão para permitir geolocalização mais tarde; não armazenar coordenadas precisas sem consentimento explícito.

8. Caching e TTL
	- Ambiguidade: "caching curto" não tem valor definido.
	- Proposta: TTL padrão de 10 minutos para dados de previsão por coordenada+unidade; confirmar se esse valor é aceitável.

9. Provedores de API e fallback
	- Ambiguidade: menciona Open-Meteo, mas não define comportamento em caso de falha ou limites de rate.
	- Pergunta: haverá um provedor de fallback ou mostraremos uma mensagem de erro? Definir política de retry/backoff.
    - Resposta: Para o MVP, mostrar mensagem de erro.

10. Privacidade e retenção de dados
	- Ambiguidade: política de retenção para histórico de buscas e geolocalização não definida.
	- Pergunta: qual é o período aceitável para reter histórico local (sugestão: apagamento automático após 30 dias ou manter somente última busca)?
    - Resposta: reter histórico de busca, mas nunca a geolocalização do usuário.

11. Metas de desempenho e métricas
	- Ambiguidade: metas (ex.: respostas em cache <1s; requisições novas <3s) carecem de contexto de medição.
	- Pergunta: em qual ambiente/condições essas metas devem ser validadas (rede móvel 4G, desktop com Wi‑Fi, median latency)?
    - Resposta: no ambiente de mais facilidade para teste.

12. Testabilidade
	- Ambiguidade: cobertura mínima de testes (unit/E2E) não especificada.
	- Pergunta: qual percentual mínimo de cobertura e quais fluxos E2E são críticos (busca, seleção, alternância de unidades, geolocalização)?
    - Resposta: cobrir todo o código sempre que possível. Para o MVP, a lista dada como exemplo na pergunta pode servir.

Observação: para remover ambiguidades rapidamente, posso aplicar decisões razoáveis (ex.: debounce 300ms, 7 sugestões, TTL 10min, WCAG 2.1 AA) e anotar essas escolhas no spec — deseja que eu tome essas decisões por padrão ou que deixe as perguntas abertas para você responder?

Observação: novos requisitos funcionais podem ser adicionados sob demanda (ex.: favoritos, notificações push, histórico de buscas, modo offline). Indique as funcionalidades desejadas para que sejam formalizadas e priorizadas.