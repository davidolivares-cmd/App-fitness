/** Shared boundaries for manually entered portions and nutrition values. */
export function isValidFoodGrams(grams: number): boolean {
  return Number.isFinite(grams) && grams >= 1 && grams <= 5000
}

export function isValidNutritionPer100g(values: number[]): boolean {
  return values.length === 4 && values.every((value) => Number.isFinite(value) && value >= 0 && value <= 1000)
}
