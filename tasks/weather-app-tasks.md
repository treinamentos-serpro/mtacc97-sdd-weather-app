# Weather App — Backlog de Tarefas

Tarefas derivadas de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md).
Organizadas por entrega, em ordem de dependência.

> Revisão de complexidade: tarefas que acumulavam múltiplas responsabilidades
> (fetch + mapping de dados, estado + várias ações, múltiplos cenários E2E)
> foram divididas em unidades menores e independentemente testáveis.

> Revisão de dependências: a tarefa de cache (antes na seção de hardening)
> dependia apenas dos serviços de API, sem relação com hook, UI ou
> acessibilidade — foi movida para a seção 2 e renumerada.

## 1. Fundação e tipos

### T-01 — Definir tipos compartilhados do domínio
- Critérios de aceite:
  - `src/types/weather.ts` exporta `LocationSuggestion`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Units` conforme o modelo de dados do plano.
  - Tipos usam `null` explícito para campos que podem estar indisponíveis.
- Dependências: nenhuma.
- Arquivos: `src/types/weather.ts`.

### T-02 — Utilitários de conversão de temperatura e vento
- Critérios de aceite:
  - Funções puras para converter Celsius ↔ Fahrenheit e km/h ↔ mph.
  - Testes unitários cobrindo casos de arredondamento e valores negativos.
- Dependências: T-01.
- Arquivos: `src/lib/temperature.ts`, `tests/unit/temperature.test.ts`.

### T-03 — Utilitário de formatação (datas, textos, unidades)
- Critérios de aceite:
  - Funções para formatar data no timezone local da cidade e para formatar "dados indisponíveis no momento" quando um campo é `null`.
  - Testes unitários cobrindo timezone e campo ausente.
- Dependências: T-01.
- Arquivos: `src/lib/format.ts`, `tests/unit/format.test.ts`.

### T-04 — Mapear códigos de condição climática (weather_code) para texto/ícone
- Critérios de aceite:
  - Função que traduz `weather_code` da Open-Meteo para texto de condição e ícone.
  - Testes unitários cobrindo pelo menos os códigos de sol, chuva e nublado.
- Dependências: T-01.
- Arquivos: `src/lib/weatherCodes.ts`, `tests/unit/weatherCodes.test.ts`.

## 2. Integração com APIs

### T-05 — Serviço de geocoding (busca de localidade)
- Critérios de aceite:
  - Função que chama `GET https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=pt&format=json`.
  - Retorna no máximo 5 `LocationSuggestion` mapeadas a partir da resposta.
  - Lança/retorna erro tratável em caso de falha de rede ou resposta inválida.
  - Testes unitários com mocks de fetch para sucesso, zero resultados e erro.
- Dependências: T-01.
- Arquivos: `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.

### T-06 — Buscar dados brutos de clima atual e previsão (fetch)
- Critérios de aceite:
  - Função que chama `GET https://api.open-meteo.com/v1/forecast` com os parâmetros `current`, `daily`, `timezone=auto` e `forecast_days=5`.
  - Retorna a resposta bruta tipada (sem mapear para o modelo de domínio ainda).
  - Lança/retorna erro tratável em caso de falha de rede ou resposta HTTP não-OK.
  - Testes unitários com mocks de fetch cobrindo sucesso e erro de rede/HTTP.
- Dependências: T-01.
- Arquivos: `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.

### T-07 — Mapear resposta bruta para `CurrentWeather` e `ForecastDay[]`
- Critérios de aceite:
  - Função que transforma a resposta de T-06 em `CurrentWeather` e `ForecastDay[]`, usando T-04 para condição/ícone.
  - Campos ausentes na resposta viram `null` em vez de causar falha.
  - Testes unitários cobrindo resposta completa e resposta com campos faltando.
- Dependências: T-01, T-04, T-06.
- Arquivos: `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.

### T-08 — Retry com backoff para chamadas de API
- Critérios de aceite:
  - Wrapper de requisição com retries curtos e backoff exponencial antes de propagar erro final.
  - Testes unitários simulando falha temporária seguida de sucesso, e falha persistente.
- Dependências: T-05, T-06.
- Arquivos: `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.

### T-09 — Cache de requisições (TTL 10 minutos)
- Critérios de aceite:
  - Respostas de geocoding/weather reutilizadas por até 10 minutos para a mesma localidade/unidade.
  - Cache invalidado ao trocar localidade ou unidade.
  - Testes unitários cobrindo hit e invalidação de cache.
- Dependências: T-05, T-06, T-07, T-08.
- Arquivos: `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.

## 3. Estado da aplicação

### T-10 — Hook `useWeather`: estado base e `searchLocation`
- Critérios de aceite:
  - Hook expõe `searchQuery`, `suggestions`, `loading`, `error`, `status`.
  - `searchLocation` aplica debounce de 300ms antes de chamar o serviço de geocoding (T-05).
  - Testes unitários (via Testing Library / renderHook) cobrindo digitação, debounce, sucesso e erro.
- Dependências: T-05, T-08, T-09.
- Arquivos: `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`.

### T-11 — Hook `useWeather`: `selectLocation` e `refreshWeather`
- Critérios de aceite:
  - `selectLocation` define `selectedLocation` e busca clima atual + previsão (T-06, T-07), atualizando `weatherData`, `loading` e `error`.
  - `refreshWeather` repete a busca para a localidade atualmente selecionada.
  - Testes unitários cobrindo seleção com sucesso e com falha de API.
- Dependências: T-07, T-08, T-09, T-10.
- Arquivos: `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`.

### T-12 — `toggleUnits` e persistência de preferências
- Critérios de aceite:
  - `toggleUnits` alterna `units` (temperatura e vento) e atualiza o estado imediatamente.
  - `units` e última localidade selecionada são salvos em `localStorage` a cada alteração.
  - Ao montar, o hook restaura `units`/localidade de `localStorage`, se existirem.
  - Testes unitários cobrindo alternância, persistência e restauração.
- Dependências: T-10, T-11.
- Arquivos: `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`.

### T-13 — Ação `useGeolocation` (geolocalização opcional)
- Critérios de aceite:
  - Ação solicita permissão de geolocalização do navegador.
  - Se concedida, obtém coordenadas e chama `selectLocation`/busca de clima diretamente.
  - Se negada ou indisponível, mantém a busca manual funcional e sinaliza o estado ao hook.
  - Testes unitários com mocks de `navigator.geolocation` cobrindo permissão concedida e negada.
- Dependências: T-11.
- Arquivos: `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`.

## 4. Componentes de UI

### T-14 — Componente `SearchBar` com autocomplete
- Critérios de aceite:
  - Campo de busca acessível (label, roles) que exibe até 5 sugestões.
  - Seleção de uma sugestão dispara `selectLocation`.
  - Navegável por teclado (setas + Enter).
  - Testes unitários com Testing Library cobrindo digitação, seleção e navegação por teclado.
- Dependências: T-10, T-11.
- Arquivos: `src/components/SearchBar.tsx`, `tests/unit/SearchBar.test.tsx`.

### T-15 — Componente `UnitToggle`
- Critérios de aceite:
  - Alterna Celsius/Fahrenheit e km/h/mph, chamando `toggleUnits`.
  - Roles/labels semânticos e acessível via teclado.
  - Testes unitários cobrindo alternância e chamada da ação.
- Dependências: T-12.
- Arquivos: `src/components/UnitToggle.tsx`, `tests/unit/UnitToggle.test.tsx`.

### T-16 — Componente `CurrentWeather`
- Critérios de aceite:
  - Exibe temperatura, umidade, precipitação, UV, vento e condição/ícone.
  - Exibe timestamp de última atualização.
  - Campos `null` mostram "dados indisponíveis no momento".
- Dependências: T-01, T-03, T-04.
- Arquivos: `src/components/CurrentWeather.tsx`.

### T-17 — Componentes `ForecastCard` e `ForecastList`
- Critérios de aceite:
  - `ForecastCard` exibe data (timezone local), min/max e condição de um dia.
  - `ForecastList` renderiza 5 `ForecastCard` a partir de `WeatherData.forecast`.
- Dependências: T-01, T-03, T-04.
- Arquivos: `src/components/ForecastCard.tsx`, `src/components/ForecastList.tsx`.

### T-18 — Componentes de estado (`LoadingState`, `ErrorState`, `EmptyState`)
- Critérios de aceite:
  - `LoadingState` exibido durante requisições pendentes.
  - `ErrorState` exibe mensagem amigável e ação sugerida em falha de API/rede.
  - `EmptyState` exibido quando a busca não retorna resultados.
  - Todos acessíveis (roles/aria apropriados).
- Dependências: T-10, T-11.
- Arquivos: `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`, `src/components/states/EmptyState.tsx`.

### T-19 — Orquestração em `App.tsx`
- Critérios de aceite:
  - `App.tsx` conecta `useWeather` aos componentes de busca, clima atual, previsão, unidades e estados.
  - Layout responsivo (mobile e desktop) usando Tailwind.
  - Testes unitários de integração cobrindo o fluxo busca → seleção → exibição.
- Dependências: T-10 a T-18.
- Arquivos: `src/App.tsx`, `tests/unit/App.test.tsx`.

## 5. Hardening e qualidade

### T-20 — Acessibilidade (WCAG 2.1 AA)
- Critérios de aceite:
  - Auditoria manual/ferramenta (ex.: axe) sem violações críticas nos componentes principais.
  - Foco visível e navegação por teclado validados em `SearchBar`, `UnitToggle` e cards de clima.
- Dependências: T-14 a T-19.
- Arquivos: `src/components/**`.

### T-21 — E2E: busca, seleção e exibição de clima
- Critérios de aceite:
  - Cenário Playwright: usuário busca uma localidade, seleciona uma sugestão e vê clima atual + previsão de 5 dias.
- Dependências: T-19, T-20.
- Arquivos: `tests/e2e/weather.spec.ts`.

### T-22 — E2E: alternância de unidades e persistência
- Critérios de aceite:
  - Cenário Playwright: usuário alterna unidades, recarrega a página e as unidades permanecem aplicadas.
- Dependências: T-19, T-20.
- Arquivos: `tests/e2e/weather.spec.ts`.

### T-23 — E2E: estado de erro em falha de API
- Critérios de aceite:
  - Cenário Playwright: com a API simulando falha, o app exibe o estado de erro com mensagem amigável.
- Dependências: T-19, T-20.
- Arquivos: `tests/e2e/weather.spec.ts`.

### T-24 — E2E: geolocalização negada mantém busca manual
- Critérios de aceite:
  - Cenário Playwright: ao negar permissão de geolocalização, a busca manual continua funcional e uma orientação é exibida.
- Dependências: T-19, T-20.
- Arquivos: `tests/e2e/weather.spec.ts`.

### T-25 — Lint, build e checklist final
- Critérios de aceite:
  - `pnpm lint`, `pnpm build` e `pnpm test` executam sem erros.
  - Cobertura de testes unitários revisada para `src/services`, `src/hooks` e componentes críticos.
- Dependências: T-01 a T-24.
- Arquivos: repositório completo.
