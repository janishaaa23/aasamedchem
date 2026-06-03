import Decimal from 'decimal.js'

/**
 * Unit Conversion System
 *
 * Strategy:
 * - All quantities are stored internally in base units:
 *   - Weight: grams (g)
 *   - Volume: milliliters (mL)
 *   - Count: items
 *
 * - Conversion happens at display time and before saving
 * - Using Decimal.js for high precision arithmetic
 */

export type UnitDimension = 'weight' | 'volume' | 'count'

export const UNIT_CONVERSIONS: Record<string, Record<string, Decimal>> = {
  weight: {
    g: new Decimal(1),
    kg: new Decimal(1000),
  },
  volume: {
    mL: new Decimal(1),
    L: new Decimal(1000),
  },
  count: {
    item: new Decimal(1),
  },
}

export const UNIT_DISPLAY_NAMES: Record<string, string> = {
  g: 'Grams',
  kg: 'Kilograms',
  mL: 'Milliliters',
  L: 'Liters',
  item: 'Items',
}

/**
 * Convert quantity from any unit to base unit
 * @param quantity - The quantity to convert
 * @param unit - The unit to convert from
 * @param dimension - The dimension (weight, volume, count)
 * @returns Quantity in base unit
 */
export function convertToBaseUnit(
  quantity: string | number | Decimal,
  unit: string,
  dimension: UnitDimension
): Decimal {
  const qty = new Decimal(quantity)
  const conversions = UNIT_CONVERSIONS[dimension]

  if (!conversions || !conversions[unit]) {
    throw new Error(`Invalid unit "${unit}" for dimension "${dimension}"`)
  }

  return qty.times(conversions[unit])
}

/**
 * Convert quantity from base unit to display unit
 * @param quantityInBase - The quantity in base unit
 * @param toUnit - The unit to convert to
 * @param dimension - The dimension (weight, volume, count)
 * @returns Quantity in the display unit
 */
export function convertFromBaseUnit(
  quantityInBase: string | number | Decimal,
  toUnit: string,
  dimension: UnitDimension
): Decimal {
  const qty = new Decimal(quantityInBase)
  const conversions = UNIT_CONVERSIONS[dimension]

  if (!conversions || !conversions[toUnit]) {
    throw new Error(`Invalid unit "${toUnit}" for dimension "${dimension}"`)
  }

  return qty.dividedBy(conversions[toUnit])
}

/**
 * Calculate price based on quantity and base price
 * Price is stored per base unit internally
 * @param quantityInBase - Quantity in base unit
 * @param basePricePerUnit - Price per base unit in INR
 * @returns Total price in INR
 */
export function calculatePrice(
  quantityInBase: string | number | Decimal,
  basePricePerUnit: string | number | Decimal
): Decimal {
  return new Decimal(quantityInBase).times(new Decimal(basePricePerUnit))
}

/**
 * Calculate price per chosen unit
 * @param basePricePerUnit - Price per base unit in INR
 * @param unit - The unit to calculate price for
 * @param dimension - The dimension
 * @returns Price per chosen unit in INR
 */
export function getPricePerUnit(
  basePricePerUnit: string | number | Decimal,
  unit: string,
  dimension: UnitDimension
): Decimal {
  const conversions = UNIT_CONVERSIONS[dimension]

  if (!conversions || !conversions[unit]) {
    throw new Error(`Invalid unit "${unit}" for dimension "${dimension}"`)
  }

  return new Decimal(basePricePerUnit).times(conversions[unit])
}

/**
 * Get available units for a dimension
 */
export function getUnitsForDimension(dimension: UnitDimension): string[] {
  return Object.keys(UNIT_CONVERSIONS[dimension] || {})
}

/**
 * Format price as INR
 */
export function formatINR(price: string | number | Decimal): string {
  const num = new Decimal(price).toNumber()
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num)
}

/**
 * Format quantity with unit
 */
export function formatQuantity(
  quantity: string | number | Decimal,
  unit: string
): string {
  const num = new Decimal(quantity).toNumber()
  return `${num.toFixed(2)} ${unit}`
}
