# Weather App Specification

## Overview

`Weather App` é uma aplicação web responsiva que permite aos usuários pesquisar cidades e obter informações meteorológicas imediatas: clima atual e previsão para os próximos 5 dias. A interface será construída em React + Vite e consumirá APIs públicas de geocoding e previsão sem exigir chave de API. O produto deve ser acessível, lidar claramente com estados de carregamento, erro e vazio, e suportar alternância de unidades de medida.

## Functional Requirements

1. Search and select location
   - The user can search for a location by city, state, or neighborhood.
   - The application provides autocomplete suggestions via a geocoding API, with a maximum of 5 suggestions and a 300ms debounce delay.
   - The user can select a suggestion to load both current weather and the 5-day forecast for that location.

2. Current weather display
   - After selecting a location, the application displays current weather data including:
     - temperature
     - humidity
     - precipitation or precipitation probability
     - UV index
     - wind speed and direction
     - condition text and icon
   - The application shows when the data was last updated.

3. 5-day forecast display
   - The application displays a daily forecast for the next 5 days.
   - Each forecast entry includes daily minimum and maximum temperatures and a summary of conditions (including chance of rain).
   - Forecast dates are shown in the target location's local timezone.

4. Unit toggle and persistence
   - The user can toggle between Celsius and Fahrenheit.
   - The user can toggle between km/h and mph for wind speed.
   - The chosen unit preferences are applied immediately and persisted locally using browser storage.

5. Application states
   - The application clearly shows a loading state while requests are in progress.
   - The application shows an error state with a friendly message when an API call fails or a network error occurs.
   - The application shows an empty state when no search results are found.

6. Optional geolocation
   - The user can optionally grant browser geolocation permission to load weather for the current location.
   - If permission is denied, the app continues to function with manual search.

## User Stories

- As a **Usuário Casual**, I want to search for my city or use my current location so I can see the current weather and plan my day.
- As a **Viajante / Turista**, I want to search for destinations with autocomplete so I can confirm weather conditions before I travel.
- As a **Profissional ao Ar Livre**, I want detailed weather metrics and accurate units so I can make safe operational decisions.
- As a **Usuário de Preferência**, I want the app to remember my preferred units so I don't have to switch them each time I return.
- As a **Usuário de Confiabilidade**, I want the app to show clear error and loading states so I can understand when data is unavailable or when I should try again.

## Acceptance Criteria

1. Search and location selection
   - Given the user types a location, the app shows autocomplete suggestions within 300ms of typing pause.
   - Given the user types a location, the app shows a maximum of 5 suggestions.
   - Given a suggestion is selected, the app loads both current weather and the 5-day forecast for that location.
   - Given the search returns no results, the app displays an empty state.

2. Current weather display
   - Given a valid location is selected, the UI shows temperature, humidity, precipitation, UV index, wind, and weather condition.
   - If any field is unavailable from the API, the UI displays "dados indisponíveis no momento" for that field.
   - The UI shows the last update timestamp.

3. Forecast display
   - Given a valid location, the app displays 5 forecast cards including min/max temperature and condition summary.
   - Dates are displayed in the location's local timezone.

4. Unit toggles
   - Given the user switches units, the app updates all values immediately.
   - Given the page reloads, previously selected units are restored from local storage.

5. Application states
   - The app displays a loading indicator during API calls.
   - On API failure or network error, the app displays an error state with a friendly message.
   - On zero autocomplete results, the app displays an empty state message.

6. Geolocation
   - If geolocation permission is granted, weather loads for the current position.
   - If permission is denied, the app shows the manual search UI and a prompt explaining how to enable location later.

## Non-Functional Requirements

- Responsiveness
  - The interface must adapt to mobile and desktop screens with a usable layout on all viewports.

- Accessibility
  - The application must follow WCAG 2.1 AA principles.
  - Interactive elements must be keyboard accessible, have accessible labels, and visible focus states.

- Performance
  - Use debounce for search input and cache recent requests for up to 10 minutes.
  - Target cached responses under 1s and fresh requests under 3s in a typical test environment.

- Robustness
  - Handle API errors, network failures, and partial data gracefully.
  - Implement retries with a short exponential backoff before showing an error.

- Privacy and Security
  - Do not store personal location data without consent.
  - Request geolocation permission explicitly and do not persist coordinates.

- Compatibility and Maintainability
  - Support modern browsers: Chrome, Edge, Firefox, Safari.
  - Keep code modular, testable, and maintainable with unit and E2E tests.

## Edge Cases

- User submits an empty search.
- Autocomplete returns zero matches.
- The selected location has partial weather data.
- API returns a network error or times out.
- Geolocation permission is denied.
- The user changes units after data is loaded.
- The user reloads the page and preferences must persist.

## Assumptions

- The app will use a public geocoding API and a public weather API similar to Open-Meteo.
- No API key is required for the MVP.
- Local persistence is provided by browser storage.
- The app does not require user authentication.
- Address/CEP search and hourly breakdown are out of scope for MVP.

## Risks

- API provider downtime or rate limiting could make weather data unavailable.
- Incomplete or inaccurate API data may reduce user trust.
- Failure to meet accessibility standards could exclude users and create compliance issues.
- Browser incompatibility or layout regressions could harm usability.
- Incorrect unit conversion could cause user misunderstandings.

## Out of Scope

- Favorites, push notifications, offline mode, and account synchronization.
- Support for CEP, full address, or coordinates search in the MVP.
- Multiple weather providers or automatic provider fallback in the MVP.
- Hourly weather breakdown; only daily forecast is required.
