const BASE_FARE = 250;
const INCLUDED_METERS = 1200;
const PER_KM_RATE = 90;
const SUBURB_SURCHARGE = 100;

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
  return Math.round(totalPrice / 10) * 10;
}

export const TARIFFS = {
  economy: { name: 'Эконом', multiplier: 1 },
  comfort: { name: 'Комфорт', multiplier: 1.4 },
  business: { name: 'Бизнес', multiplier: 2.0 },
};
