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

Observação: novos requisitos funcionais podem ser adicionados sob demanda (ex.: favoritos, notificações push, histórico de buscas, modo offline). Indique as funcionalidades desejadas para que sejam formalizadas e priorizadas.