import { additionalRecipeCatalog } from './recipes-extra'

export type MealType = 'Desayuno' | 'Comida' | 'Cena' | 'Snack'
export type RecipeCategory = 'Platos de cuchara' | 'Platos elaborados' | 'Platos fríos' | 'Para llevar a la oficina'

export type RecipeIngredient = {
  foodId?: string
  name: string
  grams: number
  caloriesPer100g?: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
  isMatchable?: boolean
}

export type RecipeNutrition = { calories: number; protein: number; carbs: number; fat: number }

export type Recipe = {
  id: string
  name: string
  type: MealType
  category: RecipeCategory
  time: number
  description: string
  image?: string
  ingredients: RecipeIngredient[]
  steps: string[]
  nutrition: RecipeNutrition
  nutritionSource: 'recetario' | 'estimacion'
  source: string
  matchCount?: number
  matchPercentage?: number
  missing?: string[]
}

export const recipeCategories: RecipeCategory[] = ['Platos de cuchara', 'Platos elaborados', 'Platos fríos', 'Para llevar a la oficina']

const img = (filename: string) => `${import.meta.env.BASE_URL}recipes/${filename}`
const ingredient = (name: string, grams: number, foodId?: string, isMatchable = true): RecipeIngredient => ({ name, grams, foodId, isMatchable })
const recipe = (entry: Recipe): Recipe => entry

// Recetas adaptadas a una ración. Las del recetario V2 conservan los macros publicados por ración;
// en las demás, calorías y macros son estimaciones calculadas con las cantidades de una ración.
export const recipeCatalog: Recipe[] = [
  recipe({
    id: 'v2-hummus-remolacha', name: 'Hummus de remolacha con crudités', type: 'Snack', category: 'Platos fríos', time: 20,
    description: 'Crema de garbanzos y remolacha con bastones crujientes de verdura.', image: img('hummus-remolacha.webp'),
    ingredients: [ingredient('Remolacha cocida', 125), ingredient('Garbanzos cocidos', 100, 'chickpeas'), ingredient('Yogur natural', 8), ingredient('Tahini', 8), ingredient('Ajo', 2, undefined, false), ingredient('Aceite de oliva virgen extra', 20, 'olive-oil', false), ingredient('Zumo de limón', 5, undefined, false), ingredient('Pimiento rojo', 20, 'pepper'), ingredient('Apio', 20), ingredient('Comino y pimentón', 4, undefined, false)],
    steps: ['Tritura la remolacha y los garbanzos con el yogur, el tahini, el ajo, el limón y el comino.', 'Ajusta la textura con un poco de agua y sirve con el pimiento y el apio en bastones.', 'Termina con aceite de oliva y una pizca de pimentón.'],
    nutrition: { calories: 462, protein: 14.8, carbs: 33.4, fat: 29.9 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 20–21'
  }),
  recipe({
    id: 'v2-patatas-dos-salsas', name: 'Patatitas con dos salsas', type: 'Snack', category: 'Platos elaborados', time: 10,
    description: 'Patatas tiernas con salsa fresca de hierbabuena y salsa especiada.', image: img('patatas-dos-salsas.webp'),
    ingredients: [ingredient('Patatas pequeñas', 200, 'potato'), ingredient('Yogur griego natural', 125, 'yogurt'), ingredient('Ajo', 2, undefined, false), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Hierbabuena', 2, undefined, false), ingredient('Curry y pimienta', 3, undefined, false), ingredient('Zumo de limón y sal', 5, undefined, false)],
    steps: ['Cuece las patatas en el microondas o en agua hasta que estén tiernas.', 'Mezcla la mitad del yogur con hierbabuena, ajo, limón y aceite.', 'Mezcla el resto del yogur con curry y pimienta y sirve las dos salsas junto a las patatas.'],
    nutrition: { calories: 336, protein: 10.9, carbs: 41.1, fat: 14.2 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 22–23'
  }),
  recipe({
    id: 'v2-falso-sushi-pepino', name: 'Falso sushi de pepino, yogur y feta', type: 'Cena', category: 'Platos fríos', time: 15,
    description: 'Rollitos frescos de pepino rellenos de crema de yogur y queso feta.', image: img('falso-sushi-pepino.webp'),
    ingredients: [ingredient('Pepino', 135, 'cucumber'), ingredient('Yogur griego natural', 63, 'yogurt'), ingredient('Queso feta', 25), ingredient('Pimiento amarillo', 50), ingredient('Cebolla morada', 20, 'onion'), ingredient('Ajo', 2, undefined, false), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Limón y pimienta', 3, undefined, false)],
    steps: ['Corta el pepino en tiras finas y seca el exceso de agua.', 'Mezcla el yogur con el feta desmigado, el ajo, la ralladura de limón y un poco de aceite.', 'Reparte la crema, el pimiento y la cebolla sobre las tiras; enróllalas y sirve frías.'],
    nutrition: { calories: 186, protein: 8.3, carbs: 10.7, fat: 12.2 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 24–25'
  }),
  recipe({
    id: 'v2-gazpacho-sandia', name: 'Gazpacho de sandía y feta', type: 'Comida', category: 'Platos fríos', time: 10,
    description: 'Sopa fría de tomate y sandía con queso feta y albahaca.', image: img('gazpacho-sandia.webp'),
    ingredients: [ingredient('Tomate pera', 125, 'tomato'), ingredient('Sandía', 125), ingredient('Pimiento rojo', 75, 'pepper'), ingredient('Cebolleta', 20, 'onion'), ingredient('Queso feta', 25), ingredient('Ajo', 2, undefined, false), ingredient('Aceite de oliva', 15, 'olive-oil', false), ingredient('Vinagre y albahaca', 5, undefined, false)],
    steps: ['Tritura los tomates con la sandía, el pimiento, la cebolleta y unas hojas de albahaca.', 'Añade aceite, vinagre y sal, y vuelve a triturar hasta obtener una textura fina.', 'Enfría y sirve con dados de sandía y queso feta.'],
    nutrition: { calories: 310, protein: 8.4, carbs: 22.1, fat: 20.9 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 26–27'
  }),
  recipe({
    id: 'v2-carpaccio-remolacha', name: 'Carpaccio de remolacha y champiñón', type: 'Cena', category: 'Platos fríos', time: 10,
    description: 'Láminas de remolacha y champiñón con rúcula, avellanas y queso curado.', image: img('carpaccio-remolacha.webp'),
    ingredients: [ingredient('Remolacha cocida', 125), ingredient('Champiñones', 75), ingredient('Avellanas', 15), ingredient('Rúcula', 50), ingredient('Queso manchego curado', 15), ingredient('Aceite de oliva y vinagre', 6, 'olive-oil', false)],
    steps: ['Corta la remolacha y los champiñones en láminas finas y distribúyelos en un plato.', 'Añade la rúcula y unas lascas de queso.', 'Aliña con aceite y vinagre, y termina con las avellanas picadas.'],
    nutrition: { calories: 362, protein: 11, carbs: 13.8, fat: 29.2 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 28–29'
  }),
  recipe({
    id: 'v2-dip-guisantes', name: 'Dip de guisantes con hierbabuena', type: 'Snack', category: 'Platos fríos', time: 15,
    description: 'Puré suave de guisantes y queso fresco con totopos integrales.', image: img('dip-guisantes.webp'),
    ingredients: [ingredient('Guisantes', 150), ingredient('Queso fresco', 125, 'cheese'), ingredient('Tortilla integral', 25, 'bread'), ingredient('Pistachos', 8, 'almonds'), ingredient('Ajo', 2, undefined, false), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Hierbabuena y pimentón', 2, undefined, false)],
    steps: ['Cocina los guisantes unos minutos y tritúralos ligeramente.', 'Mezcla con el queso fresco, el ajo, la hierbabuena y los pistachos picados.', 'Corta la tortilla en triángulos, tuéstala al horno y sírvela con el dip.'],
    nutrition: { calories: 366, protein: 19.7, carbs: 21.5, fat: 22.4 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 30–31'
  }),
  recipe({
    id: 'v2-escarola-granada', name: 'Escarola con granada', type: 'Cena', category: 'Platos fríos', time: 8,
    description: 'Ensalada sencilla de escarola y granada con aliño de comino.', image: img('escarola-granada.webp'),
    ingredients: [ingredient('Escarola', 150), ingredient('Granada', 138), ingredient('Ajo', 4, undefined, false), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Vinagre, comino y sal', 4, undefined, false)],
    steps: ['Lava y escurre bien la escarola y desgrana la granada.', 'Mezcla aceite, vinagre, ajo muy picado y comino.', 'Aliña la ensalada justo antes de servir.'],
    nutrition: { calories: 182, protein: 4.6, carbs: 24.5, fat: 7.3 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, p. 32'
  }),
  recipe({
    id: 'v2-tosta-aguacate', name: 'Tosta de aguacate, requesón y tomate', type: 'Desayuno', category: 'Para llevar a la oficina', time: 5,
    description: 'Tostada integral con requesón cremoso, aguacate y tomate cherry.', image: img('tosta-requeson.webp'),
    ingredients: [ingredient('Pan integral', 45, 'bread'), ingredient('Aguacate', 75, 'avocado'), ingredient('Requesón', 63, 'cheese'), ingredient('Tomates cherry', 40, 'tomato'), ingredient('Aceite de oliva y sal', 3, 'olive-oil', false)],
    steps: ['Tuesta el pan integral.', 'Unta el requesón y añade el aguacate en láminas y los tomates cortados.', 'Aliña ligeramente y guarda en un recipiente si la llevas fuera.'],
    nutrition: { calories: 351, protein: 11.5, carbs: 30.3, fat: 20.4 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, p. 34'
  }),
  recipe({
    id: 'v2-crema-calabaza', name: 'Crema de calabaza y queso azul', type: 'Cena', category: 'Platos de cuchara', time: 15,
    description: 'Crema caliente de calabaza y puerro con queso azul y semillas.', image: img('crema-calabaza.webp'),
    ingredients: [ingredient('Calabaza', 250), ingredient('Puerro', 40), ingredient('Queso azul', 5), ingredient('Caldo de verduras', 125), ingredient('Semillas de calabaza', 8), ingredient('Aceite de oliva', 15, 'olive-oil', false), ingredient('Pimentón y sal', 3, undefined, false)],
    steps: ['Corta la calabaza y el puerro en dados y rodajas.', 'Sofríe el puerro con el aceite; añade el pimentón y la calabaza.', 'Cubre con caldo, cuece hasta que esté tierno y tritura.', 'Sirve con queso azul desmigado y semillas.'],
    nutrition: { calories: 376, protein: 14, carbs: 12.6, fat: 29.9 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 40–41'
  }),
  recipe({
    id: 'v2-salmon-arroz', name: 'Salmón exprés con arroz y pepino', type: 'Comida', category: 'Para llevar a la oficina', time: 10,
    description: 'Salmón al microondas con arroz basmati y ensalada japonesa de pepino.', image: img('salmon-arroz.webp'),
    ingredients: [ingredient('Salmón', 200, 'salmon'), ingredient('Arroz basmati cocido', 63, 'rice-cooked'), ingredient('Pepino', 150, 'cucumber'), ingredient('Cebolleta', 25, 'onion'), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Salsa de soja, vinagre y sésamo', 10, undefined, false), ingredient('Eneldo y jengibre', 2, undefined, false)],
    steps: ['Cuece el arroz y reserva. Corta el pepino en tiras y deja reposar la cebolla picada en agua unos minutos.', 'Cocina el salmón tapado en el microondas hasta que esté hecho por completo.', 'Mezcla soja, vinagre, sésamo y jengibre para aliñar el pepino.', 'Sirve el salmón con arroz y ensalada; conserva refrigerado si lo preparas para llevar.'],
    nutrition: { calories: 562, protein: 44.9, carbs: 24.3, fat: 31.7 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 44–45'
  }),
  recipe({
    id: 'v2-brocheta-pollo', name: 'Brocheta de pollo especiado con nectarina', type: 'Comida', category: 'Platos elaborados', time: 15,
    description: 'Brochetas a la plancha con pollo, nectarina y una ensalada de rúcula.', image: img('brocheta-pollo.webp'),
    ingredients: [ingredient('Pechuga de pollo', 150, 'chicken'), ingredient('Nectarina', 75), ingredient('Tomates cherry', 30, 'tomato'), ingredient('Pimiento verde', 50, 'pepper'), ingredient('Cebolla', 20, 'onion'), ingredient('Rúcula', 50), ingredient('Nueces', 13, 'almonds'), ingredient('Aceite de oliva y limón', 7, 'olive-oil', false), ingredient('Pimentón y sal', 3, undefined, false)],
    steps: ['Corta el pollo en dados y déjalo unos minutos con cebolla rallada, limón, pimentón y aceite.', 'Ensarta el pollo con la nectarina, el pimiento y los tomates.', 'Cocina las brochetas a la plancha hasta que el pollo esté bien hecho.', 'Acompaña con rúcula y nueces.'],
    nutrition: { calories: 316, protein: 38.7, carbs: 12.3, fat: 12.4 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 48–49'
  }),
  recipe({
    id: 'v2-poke-pollo', name: 'Poke de pollo, arroz integral y fruta', type: 'Comida', category: 'Para llevar a la oficina', time: 10,
    description: 'Bowl frío de pollo, arroz integral, fruta y verduras frescas.', image: img('poke-pollo.webp'),
    ingredients: [ingredient('Pechuga de pollo', 150, 'chicken'), ingredient('Arroz integral cocido', 63, 'rice-cooked'), ingredient('Melocotón', 75), ingredient('Melón', 50), ingredient('Canónigos', 40, 'spinach'), ingredient('Tomate cherry', 50, 'tomato'), ingredient('Pepino', 50, 'cucumber'), ingredient('Anacardos', 4, 'almonds'), ingredient('Aceite de oliva y limón', 6, 'olive-oil', false)],
    steps: ['Saltea el pollo en dados con un poco de aceite y sal.', 'Corta la fruta y las verduras y cuece el arroz.', 'Coloca todo en un bol y termina con anacardos y aliño de aceite y limón.'],
    nutrition: { calories: 451, protein: 40.3, carbs: 38.8, fat: 15 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 52–53'
  }),
  recipe({
    id: 'v2-lubina', name: 'Lubina con patatas y verduras', type: 'Cena', category: 'Platos elaborados', time: 15,
    description: 'Lomos de lubina al microondas con patata, tomate y pimiento.', image: img('lubina-patatas.webp'),
    ingredients: [ingredient('Lubina', 200), ingredient('Patata', 100, 'potato'), ingredient('Cebolla', 50, 'onion'), ingredient('Tomate', 40, 'tomato'), ingredient('Pimiento', 75, 'pepper'), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Sal', 1, undefined, false)],
    steps: ['Cuece la patata en el microondas hasta que esté tierna y córtala en rodajas.', 'Cocina la cebolla con un poco de agua y aceite en un recipiente tapado.', 'Añade el tomate, el pimiento y la lubina; cocina tapado hasta que el pescado esté hecho.', 'Sirve con la patata.'],
    nutrition: { calories: 389, protein: 45.9, carbs: 20, fat: 13.9 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 58–59'
  }),
  recipe({
    id: 'v2-lentejas-arroz', name: 'Lentejas con arroz y cúrcuma', type: 'Comida', category: 'Platos de cuchara', time: 15,
    description: 'Guiso meloso de lentejas y arroz con crema de verduras y cúrcuma.', image: img('lentejas-arroz.webp'),
    ingredients: [ingredient('Lentejas cocidas', 200, 'lentils'), ingredient('Arroz integral cocido', 63, 'rice-cooked'), ingredient('Cebolla', 40, 'onion'), ingredient('Zanahoria', 50, 'carrot'), ingredient('Tomate', 40, 'tomato'), ingredient('Aceite de oliva', 10, 'olive-oil', false), ingredient('Cúrcuma y sal', 3, undefined, false)],
    steps: ['Sofríe la cebolla y la zanahoria rallada con aceite.', 'Añade el tomate y cocina hasta que se ablande; tritura la verdura con un poco de agua y cúrcuma.', 'Incorpora las lentejas enjuagadas y hierve unos minutos.', 'Sirve con el arroz cocido.'],
    nutrition: { calories: 593, protein: 24.7, carbs: 82.5, fat: 18.2 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 70–71'
  }),
  recipe({
    id: 'v2-ramen', name: 'Ramen casero con huevo', type: 'Cena', category: 'Platos de cuchara', time: 10,
    description: 'Caldo caliente con fideos de arroz, huevo, zanahoria y brotes.', image: img('ramen.webp'),
    ingredients: [ingredient('Caldo vegetal', 500), ingredient('Fideos de arroz', 25), ingredient('Huevo', 75, 'egg'), ingredient('Zanahoria', 40, 'carrot'), ingredient('Brotes de soja', 20), ingredient('Cebolleta', 10, 'onion'), ingredient('Semillas de sésamo', 5), ingredient('Alga nori', 1)],
    steps: ['Cuece los huevos y los fideos siguiendo sus tiempos de cocción.', 'Calienta el caldo y viértelo sobre los fideos en un bol.', 'Añade zanahoria rallada, brotes, cebolleta, huevo cortado y alga nori.', 'Termina con sésamo y sirve caliente.'],
    nutrition: { calories: 311, protein: 18.4, carbs: 30.4, fat: 12.9 }, nutritionSource: 'recetario', source: 'Recetario de alimentación, pp. 82–83'
  }),
  recipe({
    id: 'quick-aguacate-huevo', name: 'Aguacates gratinados con huevo', type: 'Desayuno', category: 'Platos elaborados', time: 17,
    description: 'Mitades de aguacate al horno con huevo, parmesano y pan tostado.', image: img('aguacate-huevo.webp'),
    ingredients: [ingredient('Huevo', 50, 'egg'), ingredient('Aguacate', 75, 'avocado'), ingredient('Queso parmesano', 5), ingredient('Pan de pueblo', 40, 'bread'), ingredient('Nata ligera', 8), ingredient('Cebollino', 1, undefined, false)],
    steps: ['Parte el aguacate y retira el hueso. Coloca las mitades en una fuente.', 'Casca un huevo en cada mitad, añade parmesano y cebollino y hornea a 180 °C hasta que cuaje.', 'Sirve con un poco de nata y pan tostado.'],
    nutrition: { calories: 398, protein: 16, carbs: 33, fat: 23 }, nutritionSource: 'estimacion', source: 'Recetario de cocina rápida, p. 10'
  }),
  recipe({
    id: 'quick-huevos-brioche', name: 'Huevos al horno en brioche', type: 'Desayuno', category: 'Platos elaborados', time: 20,
    description: 'Brioche relleno de huevo y bacon, horneado hasta que la clara cuaje.', image: img('huevos-brioche.webp'),
    ingredients: [ingredient('Brioche pequeño', 45, 'bread'), ingredient('Huevo', 50, 'egg'), ingredient('Bacon', 50), ingredient('Nata ligera', 5), ingredient('Sal y pimienta', 2, undefined, false)],
    steps: ['Corta la parte superior del brioche y vacía un poco el centro.', 'Reparte el bacon picado, casca el huevo dentro y añade la nata, la sal y la pimienta.', 'Hornea a 180 °C unos 10 minutos, hasta que la clara esté cuajada; comprueba el punto antes de servir.'],
    nutrition: { calories: 450, protein: 23, carbs: 22, fat: 29 }, nutritionSource: 'estimacion', source: 'Recetario de cocina rápida, p. 8'
  }),
  recipe({
    id: 'gold-tostas-pavo', name: 'Tostas de pavo, aguacate y queso de cabra', type: 'Comida', category: 'Para llevar a la oficina', time: 20,
    description: 'Tostas templadas con pavo, aguacate, queso de cabra y rúcula.', image: img('tostas-pavo.webp'),
    ingredients: [ingredient('Pan de hogaza', 50, 'bread'), ingredient('Pechuga de pavo cocida', 44, 'turkey'), ingredient('Aguacate', 75, 'avocado'), ingredient('Queso de cabra', 75), ingredient('Rúcula', 13), ingredient('Piñones', 6), ingredient('Aceitunas negras', 10), ingredient('Ajo y aceite de oliva', 5, 'olive-oil', false)],
    steps: ['Tuesta ligeramente el pan y úntalo con ajo y aceituna machacada.', 'Añade queso de cabra y piñones y calienta unos minutos en el horno.', 'Termina con pavo, aguacate y rúcula aliñada.'],
    nutrition: { calories: 542, protein: 28, carbs: 39, fat: 30 }, nutritionSource: 'estimacion', source: 'Recetario de cocina tradicional, pp. 12–13'
  }),
  recipe({
    id: 'econ-lentejas-verduras', name: 'Lentejas con verduras', type: 'Comida', category: 'Platos de cuchara', time: 80,
    description: 'Potaje vegetal de lentejas pardinas, patata y verduras de temporada.', image: img('lentejas-verduras.webp'),
    ingredients: [ingredient('Lentejas secas', 67, 'lentils'), ingredient('Patata', 50, 'potato'), ingredient('Zanahoria', 75, 'carrot'), ingredient('Cebolla', 50, 'onion'), ingredient('Puerro', 50), ingredient('Pimiento', 38, 'pepper'), ingredient('Tomate', 40, 'tomato'), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Ajo, laurel y pimentón', 3, undefined, false)],
    steps: ['Pica las verduras y sofríe cebolla, puerro y ajo con aceite.', 'Añade pimiento, zanahoria, tomate y pimentón; remueve e incorpora las lentejas lavadas.', 'Cubre con agua y cuece a fuego suave hasta que las lentejas estén tiernas.', 'Añade la patata a mitad de cocción y ajusta la sal.'],
    nutrition: { calories: 430, protein: 24, carbs: 68, fat: 7 }, nutritionSource: 'estimacion', source: 'Recetario económico, pp. 5–9'
  }),
  recipe({
    id: 'econ-garbanzos-chorizo', name: 'Cazuela de garbanzos con chorizo', type: 'Comida', category: 'Platos de cuchara', time: 45,
    description: 'Garbanzos guisados con chorizo, patata y verduras.', image: img('garbanzos-chorizo.webp'),
    ingredients: [ingredient('Garbanzos cocidos', 200, 'chickpeas'), ingredient('Chorizo', 42), ingredient('Patata', 50, 'potato'), ingredient('Cebolla', 50, 'onion'), ingredient('Zanahoria', 38, 'carrot'), ingredient('Pimiento rojo', 20, 'pepper'), ingredient('Aceite de oliva', 5, 'olive-oil', false), ingredient('Ajo, laurel y pimentón', 3, undefined, false)],
    steps: ['Sofríe cebolla, zanahoria, ajo y pimiento con aceite y pimentón.', 'Añade chorizo, patata y garbanzos; cubre con agua y lleva a ebullición.', 'Cuece hasta que la patata esté tierna y el caldo haya tomado sabor.'],
    nutrition: { calories: 620, protein: 27, carbs: 62, fat: 29 }, nutritionSource: 'estimacion', source: 'Recetario económico, pp. 12–15'
  }),
  recipe({
    id: 'pollo-albondigas-salsa', name: 'Albóndigas de pollo con salsa', type: 'Comida', category: 'Platos elaborados', time: 20,
    description: 'Albóndigas de pollo doradas y terminadas en una salsa ligera de caldo.', image: img('albondigas-pollo.webp'),
    ingredients: [ingredient('Albóndigas de pollo', 125), ingredient('Caldo de pollo', 60), ingredient('Harina', 4), ingredient('Aceite de oliva', 8, 'olive-oil', false)],
    steps: ['Dora las albóndigas en una sartén con aceite y resérvalas.', 'Tuesta la harina en la misma sartén y añade el caldo poco a poco mientras remueves.', 'Devuelve las albóndigas y cocina a fuego suave hasta que estén hechas y la salsa espese.'],
    nutrition: { calories: 340, protein: 20, carbs: 10, fat: 24 }, nutritionSource: 'estimacion', source: 'Recetario de cocina de pollo, p. 6'
  }),
  ...additionalRecipeCatalog
]
