// lib/priceCalculator.js

const BASE_FARE = 250;           // Стоимость посадки (включает 1.2 км)
const INCLUDED_METERS = 1200;    // Включённый километраж
const PER_KM_RATE = 90;          // Стоимость за каждый км после 1.2 км
const SUBURB_SURCHARGE = 100;    // Доплата за км за пределами села

/**
 * Рассчитывает стоимость поездки
 * @param {number} distanceMeters - Расстояние в метрах
 * @param {boolean} isSuburb - Флаг "за городом"
 * @param {number} suburbDistanceKm - Расстояние за городом в км
 * @returns {number} Итоговая стоимость в тенге
 */
export function calculateTaxiPrice(distanceMeters, isSuburb = false, suburbDistanceKm = 0) {
  let totalPrice;

  if (distanceMeters <= INCLUDED_METERS) {
    totalPrice = BASE_FARE;
  } else {
    const extraMeters = distanceMeters - INCLUDED_METERS;
    const extraKm = extraMeters / 1000;
    totalPrice = BASE_FARE + (extraKm * PER_KM_RATE);
  }

  if (isSuburb) {
    totalPrice += (suburbDistanceKm * SUBURB_SURCHARGE);
  }

  // Округление до 10 тенге
  return Math.round(totalPrice / 10) * 10;
}

export const TARIFFS = {
  economy: { name: 'Эконом', multiplier: 1 },
  comfort: { name: 'Комфорт', multiplier: 1.4 },
  business: { name: 'Бизнес', multiplier: 2.0 },
};
