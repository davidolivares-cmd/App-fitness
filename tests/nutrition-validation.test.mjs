import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidFoodGrams, isValidNutritionPer100g } from '../src/lib/nutrition-validation.ts'

test('food portions must be finite and between 1 and 5000 grams', () => {
  assert.equal(isValidFoodGrams(1), true)
  assert.equal(isValidFoodGrams(5000), true)
  for (const invalid of [0, -1, 5000.1, Number.NaN, Number.POSITIVE_INFINITY]) assert.equal(isValidFoodGrams(invalid), false)
})

test('nutrition per 100 g must contain four finite non-negative values up to 1000', () => {
  assert.equal(isValidNutritionPer100g([0, 0, 0, 0]), true)
  assert.equal(isValidNutritionPer100g([884, 100, 100, 100]), true)
  for (const invalid of [[-1, 0, 0, 0], [1001, 0, 0, 0], [0, Number.NaN, 0, 0], [1, 2, 3]]) assert.equal(isValidNutritionPer100g(invalid), false)
})
