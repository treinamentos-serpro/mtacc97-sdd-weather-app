export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

export function mphToKmh(mph: number): number {
  return Math.round(mph / 0.621371);
}
