import type { RecipeIngredient, RecipeNutrition } from './recipes'
import { foodCatalog } from './foods'

type Nutrients = Omit<RecipeNutrition, 'calories'>

// Valores medios por 100 g de alimento. Son perfiles genéricos; para alimentos
// envasados prevalece siempre la etiqueta concreta. Se prioriza el nombre para
// distinguir, por ejemplo, arroz seco de arroz cocido aunque compartan foodId.
const profiles: Record<string, Nutrients> = {
  'aceite de oliva': { protein: 0, carbs: 0, fat: 100 },
  'aceite de oliva virgen extra': { protein: 0, carbs: 0, fat: 100 },
  'aceitunas negras': { protein: 1, carbs: 6, fat: 11 },
  aguacate: { protein: 2, carbs: 8.5, fat: 14.7 },
  acelga: { protein: 1.8, carbs: 3.7, fat: 0.2 },
  'alga nori': { protein: 6, carbs: 5, fat: 0.5 },
  alcaparras: { protein: 2.4, carbs: 4.9, fat: 0.9 },
  almendras: { protein: 21.2, carbs: 21.6, fat: 49.9 },
  anacardos: { protein: 18.2, carbs: 30.2, fat: 43.8 },
  anchoa: { protein: 29, carbs: 0, fat: 10 },
  apio: { protein: 0.7, carbs: 3, fat: 0.2 },
  'alubias blancas cocidas': { protein: 8.1, carbs: 21.5, fat: 0.5 },
  'arroz basmati cocido': { protein: 2.7, carbs: 28, fat: 0.3 },
  'arroz integral cocido': { protein: 2.7, carbs: 25.6, fat: 1 },
  'arroz cocido': { protein: 2.7, carbs: 28, fat: 0.3 },
  'arroz seco': { protein: 7, carbs: 79, fat: 0.7 },
  'arroz blanco': { protein: 7, carbs: 79, fat: 0.7 },
  'arroz basmati': { protein: 7.5, carbs: 78, fat: 0.7 },
  'arroz integral': { protein: 7.5, carbs: 76, fat: 2.7 },
  atún: { protein: 26, carbs: 0, fat: 1 },
  'atún al natural': { protein: 26, carbs: 0, fat: 1 },
  avellanas: { protein: 15, carbs: 17, fat: 61 },
  bacon: { protein: 37, carbs: 1.4, fat: 42 },
  beicon: { protein: 37, carbs: 1.4, fat: 42 },
  berenjena: { protein: 1, carbs: 6, fat: 0.2 },
  brócoli: { protein: 2.8, carbs: 6.6, fat: 0.4 },
  'brioche pequeño': { protein: 9, carbs: 49, fat: 12 },
  'brotes de soja': { protein: 3, carbs: 6, fat: 1 },
  calabacín: { protein: 1.2, carbs: 3.1, fat: 0.3 },
  calabaza: { protein: 1, carbs: 6.5, fat: 0.1 },
  'caldo de pollo': { protein: 1, carbs: 0.5, fat: 0.5 },
  'caldo de verduras': { protein: 0.5, carbs: 1, fat: 0.2 },
  'caldo vegetal': { protein: 0.5, carbs: 1, fat: 0.2 },
  'caldo de pescado': { protein: 1, carbs: 0.5, fat: 0.2 },
  'carne picada magra': { protein: 21, carbs: 0, fat: 10 },
  canónigos: { protein: 2, carbs: 3.6, fat: 0.4 },
  cebolla: { protein: 1.1, carbs: 9.3, fat: 0.1 },
  'cebolla morada': { protein: 1.1, carbs: 9.3, fat: 0.1 },
  cebolleta: { protein: 1.8, carbs: 7.3, fat: 0.2 },
  cebollino: { protein: 3.3, carbs: 4.4, fat: 0.7 },
  'ajos tiernos': { protein: 1.8, carbs: 7.3, fat: 0.2 },
  'apio y cebolla': { protein: 1, carbs: 6, fat: 0.2 },
  chalota: { protein: 2.5, carbs: 17, fat: 0.1 },
  champiñones: { protein: 3.1, carbs: 3.3, fat: 0.3 },
  chorizo: { protein: 24, carbs: 2, fat: 38 },
  conejo: { protein: 21, carbs: 0, fat: 5 },
  'costilla de cerdo': { protein: 18, carbs: 0, fat: 25 },
  escarola: { protein: 1.3, carbs: 3.4, fat: 0.2 },
  espinacas: { protein: 2.9, carbs: 3.6, fat: 0.4 },
  'espárragos verdes': { protein: 2.2, carbs: 3.9, fat: 0.1 },
  'fideos de arroz': { protein: 5, carbs: 80, fat: 0.5 },
  'fideos secos': { protein: 13, carbs: 72, fat: 2 },
  'tallarines secos': { protein: 13, carbs: 72, fat: 2 },
  'macarrones secos': { protein: 13, carbs: 72, fat: 2 },
  'filete de pescado blanco': { protein: 20, carbs: 0, fat: 2 },
  foie: { protein: 11, carbs: 5, fat: 44 },
  'foie gras': { protein: 11, carbs: 5, fat: 44 },
  gambas: { protein: 24, carbs: 0.2, fat: 0.3 },
  langostinos: { protein: 24, carbs: 0.2, fat: 0.3 },
  garbanzos: { protein: 8.9, carbs: 27.4, fat: 2.6 },
  'garbanzos cocidos': { protein: 8.9, carbs: 27.4, fat: 2.6 },
  granada: { protein: 1.7, carbs: 18.7, fat: 1.2 },
  guisantes: { protein: 5.4, carbs: 14.5, fat: 0.4 },
  harina: { protein: 10, carbs: 76, fat: 1 },
  huevo: { protein: 13, carbs: 0.7, fat: 9.5 },
  'huevo entero': { protein: 13, carbs: 0.7, fat: 9.5 },
  jamón: { protein: 20, carbs: 1, fat: 8 },
  'jamón cocido': { protein: 19, carbs: 1.5, fat: 4 },
  'jamón de pato': { protein: 23, carbs: 0, fat: 12 },
  'jamón serrano': { protein: 30, carbs: 0.5, fat: 14 },
  'jamoncitos de pollo': { protein: 18.5, carbs: 0, fat: 9 },
  'lomo curado': { protein: 30, carbs: 0.5, fat: 14 },
  leche: { protein: 3.4, carbs: 4.8, fat: 1.6 },
  'leche semidesnatada': { protein: 3.4, carbs: 4.8, fat: 1.6 },
  lechuga: { protein: 1.4, carbs: 2.9, fat: 0.2 },
  lentejas: { protein: 9, carbs: 20, fat: 0.4 },
  'lentejas cocidas': { protein: 9, carbs: 20, fat: 0.4 },
  'lentejas secas': { protein: 25, carbs: 60, fat: 1.5 },
  lubina: { protein: 20, carbs: 0, fat: 2.5 },
  rape: { protein: 18, carbs: 0, fat: 1.5 },
  merluza: { protein: 18, carbs: 0, fat: 2 },
  bacalao: { protein: 18, carbs: 0, fat: 1 },
  calamar: { protein: 16, carbs: 3, fat: 1.5 },
  mejillones: { protein: 12, carbs: 4, fat: 4 },
  mango: { protein: 0.8, carbs: 15, fat: 0.4 },
  manzana: { protein: 0.3, carbs: 13.8, fat: 0.2 },
  melocotón: { protein: 0.9, carbs: 9.5, fat: 0.3 },
  melón: { protein: 0.8, carbs: 8, fat: 0.2 },
  nectarina: { protein: 1.1, carbs: 11, fat: 0.3 },
  piña: { protein: 0.5, carbs: 13, fat: 0.1 },
  maíz: { protein: 3.4, carbs: 21, fat: 1.5 },
  mantequilla: { protein: 0.9, carbs: 0.1, fat: 81 },
  mayonesa: { protein: 1, carbs: 2, fat: 70 },
  'mayonesa ligera': { protein: 1, carbs: 8, fat: 25 },
  morcilla: { protein: 14, carbs: 1, fat: 26 },
  'nata ligera': { protein: 3, carbs: 4, fat: 15 },
  nueces: { protein: 15, carbs: 14, fat: 65 },
  'pan integral': { protein: 13, carbs: 41, fat: 4.2 },
  'pan integral tostado': { protein: 13, carbs: 41, fat: 4.2 },
  'pan de molde integral': { protein: 10, carbs: 43, fat: 4 },
  'pan de molde': { protein: 9, carbs: 49, fat: 4 },
  'pan de barra': { protein: 9, carbs: 56, fat: 1.5 },
  'pan de hamburguesa': { protein: 9, carbs: 50, fat: 7 },
  'pan de hogaza': { protein: 9, carbs: 49, fat: 2 },
  'pan de pueblo': { protein: 9, carbs: 49, fat: 2 },
  'pan tostado': { protein: 10, carbs: 69, fat: 5 },
  patata: { protein: 2, carbs: 17, fat: 0.1 },
  'patata cocida': { protein: 1.9, carbs: 17, fat: 0.1 },
  pechuga: { protein: 31, carbs: 0, fat: 3.6 },
  pollo: { protein: 20, carbs: 0, fat: 10 },
  'pollo troceado': { protein: 18.5, carbs: 0, fat: 9 },
  'pechuga de pollo': { protein: 23, carbs: 0, fat: 2.6 },
  'pechuga de pavo cocida': { protein: 29, carbs: 0, fat: 1.5 },
  muslo: { protein: 20, carbs: 0, fat: 9 },
  pepino: { protein: 0.7, carbs: 3.6, fat: 0.1 },
  pimiento: { protein: 1, carbs: 6, fat: 0.3 },
  'pimiento amarillo': { protein: 1, carbs: 6, fat: 0.3 },
  pistachos: { protein: 20, carbs: 28, fat: 45 },
  piñones: { protein: 14, carbs: 13, fat: 68 },
  puerro: { protein: 1.5, carbs: 14, fat: 0.3 },
  quinoa: { protein: 14, carbs: 64, fat: 6 },
  'quinoa seca': { protein: 14, carbs: 64, fat: 6 },
  queso: { protein: 18, carbs: 2, fat: 22 },
  'queso azul': { protein: 21, carbs: 2, fat: 29 },
  'queso de cabra': { protein: 22, carbs: 1, fat: 25 },
  'queso feta': { protein: 14, carbs: 4, fat: 21 },
  'queso fresco': { protein: 12, carbs: 3, fat: 13 },
  'queso curado': { protein: 25, carbs: 1, fat: 33 },
  'queso manchego curado': { protein: 25, carbs: 1, fat: 33 },
  'queso parmesano': { protein: 35, carbs: 4, fat: 29 },
  ricotta: { protein: 11, carbs: 3, fat: 13 },
  requesón: { protein: 11, carbs: 3, fat: 8 },
  remolacha: { protein: 1.7, carbs: 10, fat: 0.2 },
  'remolacha cocida': { protein: 1.7, carbs: 10, fat: 0.2 },
  rúcula: { protein: 2.6, carbs: 3.7, fat: 0.7 },
  salmón: { protein: 20, carbs: 0, fat: 13 },
  'salmón fresco': { protein: 20, carbs: 0, fat: 13 },
  'salmón ahumado': { protein: 18, carbs: 0, fat: 4.5 },
  sandía: { protein: 0.6, carbs: 7.6, fat: 0.2 },
  'semillas de calabaza': { protein: 30, carbs: 11, fat: 49 },
  'semillas de sésamo': { protein: 18, carbs: 23, fat: 50 },
  sésamo: { protein: 18, carbs: 23, fat: 50 },
  tahini: { protein: 17, carbs: 21, fat: 54 },
  tomate: { protein: 0.9, carbs: 3.9, fat: 0.2 },
  'tomate triturado': { protein: 1.5, carbs: 5, fat: 0.2 },
  'salsa de tomate': { protein: 1.5, carbs: 6, fat: 1 },
  'torta cenceña': { protein: 10, carbs: 70, fat: 2 },
  tortilla: { protein: 8, carbs: 45, fat: 8 },
  'tortilla integral': { protein: 8, carbs: 45, fat: 8 },
  'yogur griego natural': { protein: 9, carbs: 3.9, fat: 5 },
  'yogur natural': { protein: 3.8, carbs: 4.7, fat: 3.3 },
  zanahoria: { protein: 0.9, carbs: 9.6, fat: 0.2 },
  setas: { protein: 3, carbs: 3, fat: 0.4 },
  'setas variadas': { protein: 3, carbs: 3, fat: 0.4 },
  salsa: { protein: 2, carbs: 7, fat: 4 },
  'salsa de soja': { protein: 8, carbs: 5, fat: 0.6 },
  'salsa de soja, vinagre y sésamo': { protein: 4, carbs: 5, fat: 4 },
  'salsa de yogur': { protein: 4, carbs: 5, fat: 5 },
  'mostaza y perejil': { protein: 4, carbs: 3, fat: 3 },
  'miel y vinagreta': { protein: 0.3, carbs: 45, fat: 10 },
  mostaza: { protein: 5, carbs: 6, fat: 4 },
  miel: { protein: 0.3, carbs: 82, fat: 0 },
  sidra: { protein: 0, carbs: 5, fat: 0 },
  cerveza: { protein: 0.5, carbs: 3.5, fat: 0 },
  'vino blanco': { protein: 0.1, carbs: 2.5, fat: 0 },
  calvados: { protein: 0, carbs: 0, fat: 0 },
  'albóndigas de pollo': { protein: 17, carbs: 8, fat: 12 },
}

const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
const normalizedProfiles = Object.fromEntries(Object.entries(profiles).map(([name, values]) => [normalized(name), values]))
const zeroNutrients: Nutrients = { protein: 0, carbs: 0, fat: 0 }

function profileFor(ingredient: RecipeIngredient): Nutrients {
  const name = normalized(ingredient.name)
  const exact = normalizedProfiles[name]
  if (exact) return exact

  // Las mezclas con aceite cuentan principalmente el aceite; el resto son
  // pequeñas cantidades de hierbas o condimentos.
  if (name.includes('aceite')) return { protein: 0, carbs: 0, fat: 80 }

  // Condimentos y hierbas se pesan juntos en el recetario; su aportación a una
  // ración suele ser insignificante.
  if (/^(ajo|sal|pimenton|laurel|comino|curry|curcuma|eneldo|jengibre|hierbabuena|albahaca|vinagre|limon|zumo de limon|perejil|tomillo|romero|menta|pimienta|azafran|nora|guindilla|canela|vainilla)(\b|,| y)/.test(name)) return zeroNutrients

  // Compatibilidad segura con ingredientes del catálogo alimentario que aún
  // no tengan alias explícito. Se conserva el perfil por 100 g del alimento.
  const food = foodCatalog.find((item) => item.id === ingredient.foodId)
  if (food) return { protein: food.protein, carbs: food.carbs, fat: food.fat }
  throw new Error(`Falta un perfil nutricional para «${ingredient.name}»`)
}

export function calculateRecipeNutrition(ingredients: RecipeIngredient[]): RecipeNutrition {
  const totals = ingredients.reduce((sum, ingredient) => {
    const profile = profileFor(ingredient)
    const factor = ingredient.grams / 100
    return {
      protein: sum.protein + profile.protein * factor,
      carbs: sum.carbs + profile.carbs * factor,
      fat: sum.fat + profile.fat * factor,
    }
  }, { protein: 0, carbs: 0, fat: 0 })

  // Calorías calculadas a partir de los macros para que la energía mostrada
  // siempre sea coherente (factores de Atwater 4/4/9).
  return {
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    calories: Math.round(totals.protein * 4 + totals.carbs * 4 + totals.fat * 9),
  }
}
