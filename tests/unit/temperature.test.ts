import { describe, expect, it } from 'vitest';
import { celsiusToFahrenheit, fahrenheitToCelsius, kmhToMph, mphToKmh } from '../../src/lib/temperature';

describe('temperature conversions', () => {
  it('converts celsius to fahrenheit', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('converts fahrenheit to celsius', () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(fahrenheitToCelsius(212)).toBe(100);
  });

  it('rounds converted values', () => {
    expect(celsiusToFahrenheit(21)).toBe(70);
  });

  it('handles negative values', () => {
    expect(celsiusToFahrenheit(-10)).toBe(14);
    expect(fahrenheitToCelsius(-10)).toBe(-23);
  });

  it('converts km/h to mph', () => {
    expect(kmhToMph(100)).toBe(62);
  });

  it('converts mph to km/h', () => {
    expect(mphToKmh(62)).toBe(100);
  });
});
