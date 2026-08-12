import { expect, test } from '@playwright/test';

const geocodingBody = {
  results: [
    { id: 1, name: 'São Paulo', admin1: 'SP', country: 'Brasil', latitude: -23.5, longitude: -46.6 },
  ],
};

const forecastBody = {
  current: {
    time: '2026-08-12T12:00:00Z',
    temperature_2m: 22,
    relative_humidity_2m: 60,
    precipitation: 0,
    uv_index: 5,
    wind_speed_10m: 10,
    wind_direction_10m: 90,
    weather_code: 0,
  },
  daily: {
    time: ['2026-08-12'],
    temperature_2m_max: [25],
    temperature_2m_min: [18],
    precipitation_probability_max: [10],
    weather_code: [0],
  },
};

async function mockWeatherApis(page: import('@playwright/test').Page, forecastStatus = 200) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(geocodingBody) }),
  );
  await page.route('**/api.open-meteo.com/**', (route) =>
    forecastStatus === 200
      ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecastBody) })
      : route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
  );
}

test('busca, seleciona e exibe clima atual e previsão', async ({ page }) => {
  await mockWeatherApis(page);
  await page.goto('/');

  await page.getByRole('combobox').fill('São Paulo');
  await page.getByText('São Paulo, SP, Brasil').click();

  await expect(page.getByText('22°C')).toBeVisible();
  await expect(page.getByLabel('Previsão para os próximos dias')).toBeVisible();
});

test('alterna unidades e persiste após reload', async ({ page }) => {
  await mockWeatherApis(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Alternar temperatura para Fahrenheit' }).click();
  await expect(page.getByText('°F', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText('°F', { exact: true })).toBeVisible();
});

test('exibe estado de erro quando a API falha', async ({ page }) => {
  await mockWeatherApis(page, 500);
  await page.goto('/');

  await page.getByRole('combobox').fill('São Paulo');
  await page.getByText('São Paulo, SP, Brasil').click();

  await expect(page.getByRole('alert')).toBeVisible();
});

test('mantém a busca manual quando a geolocalização é negada', async ({ page, context }) => {
  await mockWeatherApis(page);
  await context.grantPermissions([]);
  await page.addInitScript(() => {
    // Simula negação de permissão de geolocalização no navegador.
    Object.defineProperty(window.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_success: unknown, error: (err: unknown) => void) => error(new Error('denied')),
      },
    });
  });
  await page.goto('/');

  await page.getByRole('button', { name: 'Usar minha localização' }).click();
  await expect(page.getByRole('combobox')).toBeEnabled();
});
