import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('recalculates nutrition for every catalog recipe from its serving ingredients', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { recipeCatalog } = await server.ssrLoadModule('/src/data/recipes.ts')
    assert.equal(recipeCatalog.length, 75)

    for (const recipe of recipeCatalog) {
      assert.ok(recipe.ingredients.length > 0, `${recipe.id} has ingredients`)
      assert.ok(recipe.ingredients.every(({ grams }) => Number.isFinite(grams) && grams > 0), `${recipe.id} has positive ingredient amounts`)
      assert.ok(recipe.ingredients.every(({ name }) => name.trim()), `${recipe.id} has named ingredients`)
      assert.equal(recipe.nutritionSource, 'estimacion', `${recipe.id} is transparently marked as an estimate`)
      assert.ok(recipe.nutrition.calories > 0, `${recipe.id} has energy`)
      const macroEnergy = recipe.nutrition.protein * 4 + recipe.nutrition.carbs * 4 + recipe.nutrition.fat * 9
      assert.ok(Math.abs(recipe.nutrition.calories - macroEnergy) <= 2, `${recipe.id} energy agrees with its rounded macros`)
    }

    const byId = Object.fromEntries(recipeCatalog.map((recipe) => [recipe.id, recipe]))
    assert.ok(byId['econ-lentejas-verduras'].nutrition.protein > 15, 'dry lentils use a dry-food profile')
    assert.ok(byId['ald-arroz-pollo-horno'].nutrition.carbs > 55, 'dry rice uses a dry-food profile')
  } finally {
    await server.close()
  }
})
