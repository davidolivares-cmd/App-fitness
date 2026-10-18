import test from 'node:test'
import assert from 'node:assert/strict'
import { buildShoppingList } from '../src/lib/shopping-list.ts'

test('shopping list combines singular/plural and accented names and totals quantities', () => {
  assert.deepEqual(buildShoppingList([
    { name: 'Tomate', grams: 100 },
    { name: 'tomates', grams: 50 },
    { name: 'Cebolla', grams: 30 },
    { name: 'Cebolla', grams: 20 },
  ]), [
    { key: 'cebolla', name: 'Cebolla', grams: 50 },
    { key: 'tomate', name: 'Tomate', grams: 150 },
  ])
})

test('shopping list ignores blank, non-finite, zero and negative quantities', () => {
  assert.deepEqual(buildShoppingList([
    { name: '   ', grams: 20 }, { name: 'Arroz', grams: 0 },
    { name: 'Arroz', grams: -10 }, { name: 'Arroz', grams: Number.NaN },
  ]), [])
})
