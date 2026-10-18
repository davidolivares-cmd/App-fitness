import type { Recipe, RecipeCategory, MealType, RecipeIngredient } from './recipes'

const image = (id: string) => `${import.meta.env.BASE_URL}recipes/library/${id}.webp`
const entry = (
  id: string, name: string, type: MealType, category: RecipeCategory, time: number, description: string,
  ingredients: Array<[string, number, string?, boolean?]>, steps: string[], nutrition: [number, number, number, number], source: string
): Recipe => ({
  id, name, type, category, time, description, image: image(id),
  ingredients: ingredients.map(([ingredientName, grams, foodId, isMatchable]): RecipeIngredient => ({ name: ingredientName, grams, foodId, isMatchable })),
  steps, nutrition: { calories: nutrition[0], protein: nutrition[1], carbs: nutrition[2], fat: nutrition[3] },
  nutritionSource: 'estimacion', source
})

// Selección ampliada de los recetarios del usuario. Las cantidades se han normalizado
// a una ración y las calorías y macros son estimaciones culinarias, no valores clínicos.
export const additionalRecipeCatalog: Recipe[] = [
  entry('ald-pollo-sidra', 'Pollo a la sidra', 'Comida', 'Platos elaborados', 35, 'Pollo guisado lentamente con sidra, ajo y caldo.', [
    ['Pollo troceado', 180, 'chicken'], ['Caldo de pollo', 100], ['Sidra', 80], ['Harina', 5], ['Aceite de oliva', 5, 'olive-oil'], ['Ajo y laurel', 4, undefined, false]
  ], ['Dora el pollo con aceite y resérvalo.', 'Sofríe el ajo en la misma cazuela; añade la harina y remueve.', 'Incorpora el pollo, la sidra, el caldo y el laurel. Cocina tapado a fuego suave hasta que esté tierno.'], [370, 37, 12, 18], 'Recetario de caldo, p. 8'),
  entry('ald-jamoncitos-cerveza', 'Jamoncitos de pollo a la cerveza', 'Comida', 'Platos elaborados', 55, 'Jamoncitos con un sofrito de cebolla, zanahoria y tomate.', [
    ['Jamoncitos de pollo', 200, 'chicken'], ['Cerveza', 60], ['Caldo de pollo', 60], ['Zanahoria', 80, 'carrot'], ['Tomate', 45, 'tomato'], ['Cebolla', 40, 'onion'], ['Harina', 6], ['Aceite de oliva', 7, 'olive-oil'], ['Ajo y laurel', 4, undefined, false]
  ], ['Dora los jamoncitos con un poco de aceite y resérvalos.', 'Sofríe el ajo, la cebolla, la zanahoria y el tomate.', 'Añade cerveza y caldo; incorpora el pollo y cocina tapado hasta que esté completamente hecho.'], [390, 36, 18, 17], 'Recetario de caldo, p. 10'),
  entry('ald-arroz-pollo-horno', 'Arroz al horno con pollo crujiente', 'Comida', 'Platos de cuchara', 45, 'Arroz horneado en caldo con pollo, patata y ajo dorados.', [
    ['Arroz seco', 75, 'rice'], ['Muslo de pollo', 160, 'chicken'], ['Patata', 60, 'potato'], ['Caldo de pollo', 200], ['Aceite de oliva', 6, 'olive-oil'], ['Ajo', 4, undefined, false]
  ], ['Dora el pollo y las láminas de patata con el ajo; reserva.', 'Pon el arroz en una fuente de horno y vierte el caldo caliente.', 'Reparte por encima el pollo y la patata. Hornea a 180 °C hasta que el arroz absorba el caldo y el pollo esté hecho.'], [520, 34, 63, 12], 'Recetario de caldo, p. 12'),
  entry('ald-lentejas-costillas', 'Lentejas con costillas', 'Comida', 'Platos de cuchara', 65, 'Guiso de lentejas con costilla, tomate y un toque de ñora.', [
    ['Lentejas secas', 70, 'lentils'], ['Costilla de cerdo', 70], ['Chorizo', 15], ['Morcilla', 10], ['Caldo de pollo', 180], ['Tomate', 60, 'tomato'], ['Cebolla', 35, 'onion'], ['Pimiento verde', 25, 'pepper'], ['Aceite de oliva', 4, 'olive-oil'], ['Ajo, laurel y ñora', 4, undefined, false]
  ], ['Lava las lentejas y cuécelas con el caldo y el laurel hasta que empiecen a estar tiernas.', 'Sofríe cebolla, ajo, tomate y pimiento; dora la costilla y añade el chorizo y la morcilla.', 'Incorpora el sofrito a las lentejas y termina la cocción a fuego suave.'], [520, 29, 54, 18], 'Recetario de caldo, p. 14'),
  entry('ald-potaje-garbanzos', 'Potaje de garbanzos y espinacas', 'Comida', 'Platos de cuchara', 25, 'Garbanzos con hojas verdes, huevo cocido y caldo ligero.', [
    ['Garbanzos cocidos', 200, 'chickpeas'], ['Espinacas', 50, 'spinach'], ['Huevo', 50, 'egg'], ['Caldo de pollo', 120], ['Cebolla', 30, 'onion'], ['Aceite de oliva', 6, 'olive-oil'], ['Ajo', 3, undefined, false]
  ], ['Cuece las espinacas unos minutos y escúrrelas.', 'Sofríe cebolla y ajo; incorpora los garbanzos enjuagados y las espinacas.', 'Añade el caldo, cocina 15 minutos y sirve con huevo cocido picado.'], [460, 26, 47, 18], 'Recetario de caldo, p. 16'),
  entry('ald-gazpacho-manchego', 'Gazpacho manchego', 'Comida', 'Platos de cuchara', 45, 'Guiso de pollo, conejo y torta cenceña con pimentón.', [
    ['Pollo', 100, 'chicken'], ['Conejo', 70], ['Torta cenceña', 45], ['Caldo de pollo', 180], ['Tomate', 40, 'tomato'], ['Cebolla', 35, 'onion'], ['Aceite de oliva', 6, 'olive-oil'], ['Ajo, pimentón y sal', 4, undefined, false]
  ], ['Dora el pollo y el conejo en una cazuela con aceite y resérvalos.', 'Sofríe cebolla, ajo y tomate con pimentón; devuelve la carne y cubre con caldo.', 'Cuece hasta que la carne esté tierna, añade la torta troceada y deja reposar antes de servir.'], [530, 42, 40, 19], 'Recetario de caldo, p. 18'),
  entry('ald-pechuga-rellena-pina', 'Pechuga rellena de jamón, queso y piña', 'Comida', 'Platos elaborados', 35, 'Pechuga al horno rellena, con cebolla y piña dorada.', [
    ['Pechuga de pollo', 180, 'chicken'], ['Jamón cocido', 30], ['Queso', 25], ['Piña', 60], ['Cebolla', 40, 'onion'], ['Caldo de pollo', 60], ['Harina', 4], ['Aceite de oliva', 4, 'olive-oil'], ['Romero y pimienta', 2, undefined, false]
  ], ['Abre la pechuga, rellénala con jamón y queso y ciérrala con un palillo.', 'Dora la cebolla y sella la pechuga ligeramente enharinada.', 'Pásala a una fuente, añade piña y caldo y hornea hasta que el centro alcance una cocción segura.'], [430, 48, 22, 14], 'Recetario de caldo, p. 20'),
  entry('ald-picante-pollo', 'Pollo especiado con patata y huevo', 'Comida', 'Platos elaborados', 40, 'Pollo desmenuzado con cebolla, pan remojado, patata y huevo.', [
    ['Pechuga de pollo', 150, 'chicken'], ['Pan de molde', 35, 'bread'], ['Caldo de pollo', 100], ['Patata cocida', 60, 'potato'], ['Huevo', 40, 'egg'], ['Cebolla', 35, 'onion'], ['Nueces', 8], ['Aceite de oliva', 5, 'olive-oil'], ['Cúrcuma y chile', 3, undefined, false]
  ], ['Cuece la pechuga en el caldo, desmenúzala y reserva un poco de caldo.', 'Pocha la cebolla; añade el pan remojado en caldo y mezcla con las especias.', 'Incorpora el pollo, la patata y el huevo cocidos. Termina con nueces picadas.'], [430, 37, 36, 15], 'Recetario de caldo, p. 22'),
  entry('ald-risotto-queso', 'Risotto de queso', 'Comida', 'Platos elaborados', 40, 'Arroz cremoso con caldo, vino blanco, mantequilla y queso.', [
    ['Arroz seco', 70, 'rice'], ['Caldo de pollo', 220], ['Queso curado', 20], ['Mantequilla', 8], ['Cebolla', 40, 'onion'], ['Vino blanco', 30], ['Aceite de oliva', 4, 'olive-oil'], ['Ajo y laurel', 3, undefined, false]
  ], ['Pocha la cebolla y el ajo con aceite y un poco de mantequilla.', 'Añade el arroz y el vino; remueve hasta que el vino se evapore.', 'Ve incorporando el caldo caliente poco a poco, removiendo. Al final añade queso y una pequeña nuez de mantequilla.'], [430, 13, 64, 13], 'Recetario de caldo, p. 24'),

  entry('quick-tarrina-zanahoria', 'Tarrina de zanahoria, ricotta y beicon', 'Comida', 'Platos elaborados', 75, 'Tarrina templada de zanahoria y ricotta con beicon dorado.', [
    ['Zanahoria', 100, 'carrot'], ['Ricotta', 100], ['Huevo', 38, 'egg'], ['Beicon', 62], ['Nata ligera', 15]
  ], ['Cuece la zanahoria y tritúrala; mezcla con ricotta y huevo.', 'Dora el beicon y alterna capas con la mezcla en un molde.', 'Hornea al baño maría hasta que cuaje y deja reposar antes de cortar.'], [420, 22, 20, 26], '200 recetas ultrarrápidas, p. 50'),
  entry('quick-terrina-foie-manzana', 'Tarrina de foie y manzana', 'Snack', 'Platos elaborados', 40, 'Tarrina festiva de foie con manzana dorada y un toque de calvados.', [
    ['Foie gras', 250], ['Manzana', 150, 'apple'], ['Mantequilla', 8], ['Calvados', 10], ['Sal y pimienta', 2, undefined, false]
  ], ['Dora la manzana en láminas con mantequilla y termina con un poco de calvados.', 'Alterna capas de manzana y foie en un molde pequeño; sazona.', 'Cocina suavemente y deja enfriar con peso antes de cortar. Es una preparación muy energética y de consumo ocasional.'], [1280, 9, 26, 126], '200 recetas ultrarrápidas, p. 52'),
  entry('quick-pan-salmon', 'Pastel de salmón fresco y ahumado', 'Comida', 'Platos elaborados', 65, 'Pastel suave de salmón, eneldo y una capa de salmón ahumado.', [
    ['Salmón fresco', 125, 'salmon'], ['Salmón ahumado', 25], ['Huevo', 38, 'egg'], ['Nata ligera', 50], ['Eneldo, sal y pimienta', 2, undefined, false]
  ], ['Forra un molde pequeño y cubre la base con parte del salmón ahumado.', 'Tritura el salmón fresco con huevo, nata y eneldo; vierte la mitad en el molde.', 'Añade el resto del salmón ahumado y la mezcla. Hornea al baño maría y enfría antes de servir.'], [320, 28, 3, 20], '200 recetas ultrarrápidas, p. 54'),
  entry('quick-pescado-vainilla', 'Pescado con salsa suave de vainilla', 'Cena', 'Platos elaborados', 20, 'Filete de pescado cocido en caldo y vino con una salsa ligera aromática.', [
    ['Filete de pescado blanco', 125], ['Caldo de pescado', 75], ['Nata ligera', 60], ['Vino blanco', 38], ['Jengibre, vainilla y pimienta', 2, undefined, false]
  ], ['Calienta el vino y el caldo; añade el pescado y cuece tapado hasta que esté hecho.', 'Reduce suavemente la nata con unas cucharadas del caldo y las especias.', 'Sirve el pescado con la salsa por encima.'], [340, 28, 8, 20], '200 recetas ultrarrápidas, p. 258'),
  entry('quick-bacalao-lomo', 'Bacalao con lomo curado', 'Cena', 'Platos elaborados', 20, 'Bacalao al vapor con tomate y lomo curado dorado.', [
    ['Bacalao', 140], ['Lomo curado', 30], ['Salsa de tomate', 20, 'tomato'], ['Aceite de oliva', 3, 'olive-oil'], ['Pimentón y pimienta', 2, undefined, false]
  ], ['Cocina el bacalao al vapor hasta que se separe en lascas.', 'Dora el lomo curado en una sartén antiadherente.', 'Monta el pescado con el lomo y una cucharadita de tomate; termina con pimentón.'], [240, 37, 5, 7], '200 recetas ultrarrápidas, p. 260'),
  entry('quick-merluza-jamon', 'Rollitos de merluza con jamón y tomillo', 'Cena', 'Platos elaborados', 30, 'Merluza enrollada con jamón serrano y tomillo al horno.', [
    ['Merluza', 125], ['Jamón serrano', 25], ['Aceite de oliva', 3, 'olive-oil'], ['Tomillo, sal y pimienta', 2, undefined, false]
  ], ['Salpimienta la merluza y coloca una loncha fina de jamón sobre cada filete.', 'Enrolla y coloca los rollitos en una fuente.', 'Añade tomillo y hornea hasta que el pescado esté hecho.'], [200, 29, 4, 7], '200 recetas ultrarrápidas, p. 262'),
  entry('quick-merluza-zanahoria', 'Merluza con zanahoria y limón', 'Cena', 'Platos elaborados', 35, 'Merluza al horno bajo una capa de zanahoria, chalota y tomillo.', [
    ['Merluza', 125], ['Zanahoria', 75, 'carrot'], ['Chalota', 15, 'onion'], ['Vino blanco', 25], ['Aceite de oliva', 4, 'olive-oil'], ['Limón y tomillo', 4, undefined, false]
  ], ['Cuece las rodajas de zanahoria hasta que empiecen a ablandarse.', 'Coloca la merluza en una fuente con chalota, vino y zumo de limón.', 'Cubre con la zanahoria, sazona y hornea hasta que el pescado esté tierno.'], [180, 28, 9, 5], '200 recetas ultrarrápidas, p. 264'),

  entry('econ-crema-calabacin', 'Crema de calabacín fácil', 'Cena', 'Platos de cuchara', 35, 'Crema casera de calabacín, patata y cebolla.', [
    ['Calabacín', 200], ['Patata', 60, 'potato'], ['Cebolla', 30, 'onion'], ['Caldo de verduras', 120], ['Aceite de oliva', 6, 'olive-oil'], ['Queso fresco', 15]
  ], ['Sofríe la cebolla con aceite y añade el calabacín y la patata en dados.', 'Cubre con caldo y cocina hasta que las verduras estén tiernas.', 'Tritura, añade queso fresco y ajusta la textura con caldo.'], [185, 6, 23, 8], 'Recetas económicas, pp. 16–19'),
  entry('econ-patatas-viudas', 'Patatas viudas guisadas', 'Comida', 'Platos de cuchara', 35, 'Patata guisada con cebolla, pimiento y pimentón.', [
    ['Patata', 250, 'potato'], ['Cebolla', 35, 'onion'], ['Pimiento verde', 30, 'pepper'], ['Caldo de verduras', 200], ['Aceite de oliva', 8, 'olive-oil'], ['Ajo, laurel y pimentón', 4, undefined, false]
  ], ['Pocha la cebolla, el ajo y el pimiento con aceite.', 'Añade las patatas chascadas, el laurel y el pimentón; mezcla con cuidado.', 'Cubre con caldo y cocina a fuego suave hasta que la patata esté tierna.'], [260, 6, 45, 8], 'Recetas económicas, pp. 20–22'),
  entry('econ-alubias-chorizo', 'Alubias blancas con chorizo', 'Comida', 'Platos de cuchara', 65, 'Alubias blancas estofadas con chorizo y verduras.', [
    ['Alubias blancas cocidas', 200], ['Chorizo', 30], ['Zanahoria', 35, 'carrot'], ['Cebolla', 30, 'onion'], ['Tomate', 35, 'tomato'], ['Caldo de verduras', 120], ['Aceite de oliva', 4, 'olive-oil'], ['Ajo y pimentón', 3, undefined, false]
  ], ['Sofríe cebolla, ajo, zanahoria y tomate.', 'Añade el chorizo en rodajas, las alubias enjuagadas y el caldo.', 'Cuece a fuego bajo hasta que el guiso espese y las verduras queden tiernas.'], [470, 26, 53, 14], 'Recetas económicas, pp. 23–30'),
  entry('econ-macarrones-atun', 'Macarrones con atún y tomate', 'Comida', 'Para llevar a la oficina', 25, 'Pasta con atún, tomate y un sofrito sencillo.', [
    ['Macarrones secos', 75], ['Atún al natural', 70, 'tuna'], ['Tomate triturado', 100, 'tomato'], ['Cebolla', 30, 'onion'], ['Aceite de oliva', 6, 'olive-oil'], ['Ajo y orégano', 3, undefined, false]
  ], ['Cuece la pasta en agua con sal y escúrrela.', 'Pocha la cebolla y el ajo, añade el tomate y cocina hasta que espese.', 'Incorpora el atún desmenuzado y mezcla con la pasta.'], [430, 25, 64, 8], 'Recetas económicas, pp. 32–35'),
  entry('econ-sopa-pollo', 'Sopa casera de pollo', 'Comida', 'Platos de cuchara', 50, 'Caldo reconfortante con pollo, verduras y fideos.', [
    ['Pechuga de pollo', 100, 'chicken'], ['Fideos secos', 25], ['Patata', 50, 'potato'], ['Zanahoria', 50, 'carrot'], ['Caldo de pollo', 300], ['Apio y cebolla', 25, undefined, false]
  ], ['Calienta el caldo con zanahoria, patata, apio y cebolla picados.', 'Añade el pollo y cocina suavemente hasta que esté hecho; desmenúzalo.', 'Incorpora los fideos y cocina el tiempo indicado en el envase.'], [280, 23, 37, 5], 'Recetas económicas, pp. 39–41'),
  entry('econ-tallarines-salmon', 'Tallarines con salmón', 'Comida', 'Para llevar a la oficina', 25, 'Pasta con salmón y salsa ligera de nata.', [
    ['Tallarines secos', 75], ['Salmón', 80, 'salmon'], ['Nata ligera', 30], ['Cebolla', 25, 'onion'], ['Aceite de oliva', 4, 'olive-oil'], ['Ajo y limón', 3, undefined, false]
  ], ['Cuece los tallarines y reserva un poco del agua de cocción.', 'Pocha la cebolla, añade el salmón en dados y cocínalo hasta que cambie de color.', 'Agrega la nata y unas gotas de limón. Mezcla con la pasta y ajusta con agua de cocción.'], [470, 25, 58, 15], 'Recetas económicas, pp. 42–46'),
  entry('econ-arroz-pollo', 'Arroz con pollo casero', 'Comida', 'Platos elaborados', 45, 'Arroz meloso con pollo, verduras y tomate.', [
    ['Arroz seco', 75, 'rice'], ['Pollo', 130, 'chicken'], ['Guisantes', 30], ['Tomate', 50, 'tomato'], ['Pimiento', 40, 'pepper'], ['Caldo de pollo', 180], ['Aceite de oliva', 6, 'olive-oil'], ['Ajo y pimentón', 3, undefined, false]
  ], ['Dora el pollo en una cazuela con aceite y resérvalo.', 'Sofríe pimiento, ajo y tomate; vuelve a poner el pollo.', 'Añade arroz y caldo caliente y cocina hasta que el arroz esté en su punto.'], [510, 35, 64, 10], 'Recetas económicas, pp. 47–52'),
  entry('econ-arroz-campero', 'Arroz campero con verduras', 'Comida', 'Platos elaborados', 35, 'Arroz de verduras con pimiento, zanahoria y guisantes.', [
    ['Arroz seco', 75, 'rice'], ['Zanahoria', 35, 'carrot'], ['Pimiento', 40, 'pepper'], ['Guisantes', 35], ['Cebolla', 25, 'onion'], ['Tomate', 40, 'tomato'], ['Caldo de verduras', 180], ['Aceite de oliva', 6, 'olive-oil']
  ], ['Corta las verduras en dados y sofríe la cebolla con aceite.', 'Añade el resto de verduras y cocina unos minutos.', 'Incorpora el arroz y el caldo; cuece hasta que el arroz esté tierno y deja reposar.'], [390, 8, 70, 9], 'Recetas económicas, pp. 53–56'),
  entry('econ-pollo-champinones', 'Guiso de pollo con champiñones', 'Comida', 'Platos elaborados', 55, 'Pollo dorado con champiñones y salsa ligera.', [
    ['Pechuga de pollo', 150, 'chicken'], ['Champiñones', 100], ['Cebolla', 35, 'onion'], ['Caldo de pollo', 100], ['Harina', 4], ['Aceite de oliva', 6, 'olive-oil'], ['Tomillo y pimienta', 2, undefined, false]
  ], ['Dora el pollo con aceite y resérvalo.', 'Sofríe cebolla y champiñones hasta que pierdan parte del agua.', 'Añade harina, caldo y pollo. Cocina tapado hasta que la carne esté hecha.'], [320, 38, 15, 11], 'Recetas económicas, pp. 58–61'),
  entry('econ-pollo-cerveza', 'Pollo guisado a la cerveza', 'Comida', 'Platos elaborados', 60, 'Pollo tierno en salsa de cerveza y cebolla.', [
    ['Pollo', 150, 'chicken'], ['Cerveza', 50], ['Cebolla', 40, 'onion'], ['Caldo de pollo', 60], ['Harina', 4], ['Aceite de oliva', 5, 'olive-oil'], ['Ajo y laurel', 3, undefined, false]
  ], ['Dora el pollo con aceite y resérvalo.', 'Pocha la cebolla y el ajo; incorpora una pizca de harina.', 'Añade cerveza, caldo y pollo. Cocina a fuego bajo hasta que quede tierno.'], [350, 39, 13, 11], 'Recetas económicas, pp. 62–65'),
  entry('econ-lubina-plancha', 'Lubina a la plancha con limón', 'Cena', 'Platos elaborados', 15, 'Lubina con piel crujiente, limón y perejil.', [
    ['Lubina', 160], ['Aceite de oliva', 5, 'olive-oil'], ['Limón', 10], ['Perejil y sal', 2, undefined, false]
  ], ['Seca bien la piel del pescado con papel de cocina y sazona.', 'Cocina primero por el lado de la piel en una sartén caliente con aceite.', 'Da la vuelta y termina la cocción; sirve con limón y perejil.'], [220, 32, 0, 10], 'Recetas económicas, pp. 66–71'),
  entry('econ-tortilla-champinones', 'Tortilla de champiñones', 'Cena', 'Platos elaborados', 20, 'Tortilla jugosa con champiñones salteados.', [
    ['Huevo', 100, 'egg'], ['Champiñones', 120], ['Cebolla', 25, 'onion'], ['Aceite de oliva', 5, 'olive-oil'], ['Perejil y pimienta', 2, undefined, false]
  ], ['Saltea los champiñones y la cebolla en una sartén con aceite.', 'Bate los huevos, añade las verduras y sazona.', 'Cuaja la tortilla por ambos lados, dejando el centro al punto deseado.'], [200, 15, 7, 13], 'Recetas económicas, pp. 72–77'),
  entry('econ-tortilla-patata', 'Tortilla de patata ligera', 'Cena', 'Platos elaborados', 30, 'Versión sencilla de tortilla de patata cocinada con poca grasa.', [
    ['Patata', 150, 'potato'], ['Huevo', 100, 'egg'], ['Cebolla', 30, 'onion'], ['Aceite de oliva', 8, 'olive-oil'], ['Sal', 1, undefined, false]
  ], ['Corta la patata en láminas finas y cocínala tapada con unas cucharadas de agua.', 'Mezcla la patata tierna con huevo batido y cebolla pochada.', 'Cuaja la tortilla en una sartén antiadherente y dale la vuelta con cuidado.'], [360, 17, 36, 17], 'Recetas económicas, pp. 78–81'),
  entry('econ-bocadillo-calamares', 'Bocadillo de calamares', 'Comida', 'Para llevar a la oficina', 30, 'Calamares crujientes en pan con hojas verdes y limón.', [
    ['Calamar', 110], ['Pan de barra', 80, 'bread'], ['Harina', 10], ['Aceite de oliva', 8, 'olive-oil'], ['Lechuga', 20], ['Limón y sal', 3, undefined, false]
  ], ['Limpia los calamares y córtalos en anillas; sécalos bien.', 'Pásalos por una capa fina de harina y fríelos en tandas pequeñas.', 'Escúrrelos, añade limón y monta el bocadillo con pan y lechuga.'], [460, 26, 63, 10], 'Recetas económicas, pp. 83–87'),
  entry('econ-bocadillo-vegetal-atun', 'Bocadillo vegetal con atún', 'Comida', 'Para llevar a la oficina', 10, 'Bocadillo fresco de atún, huevo y hortalizas.', [
    ['Pan integral', 85, 'bread'], ['Atún al natural', 60, 'tuna'], ['Huevo', 40, 'egg'], ['Tomate', 30, 'tomato'], ['Lechuga', 20], ['Mayonesa ligera', 8]
  ], ['Cuece el huevo y córtalo en rodajas.', 'Abre el pan y añade lechuga, tomate, atún escurrido y huevo.', 'Añade una pequeña cantidad de mayonesa ligera y envuelve para llevar.'], [430, 27, 54, 11], 'Recetas económicas, pp. 88–92'),
  entry('econ-sandwich-huevo', 'Sándwich de huevo y tomate', 'Comida', 'Para llevar a la oficina', 20, 'Sándwich de huevo con tomate y una fina capa de salsa.', [
    ['Pan integral', 70, 'bread'], ['Huevo', 100, 'egg'], ['Tomate', 25, 'tomato'], ['Aguacate', 20, 'avocado'], ['Mayonesa ligera', 5]
  ], ['Cuece el huevo hasta que esté firme y córtalo en rodajas.', 'Tuesta ligeramente el pan y reparte el tomate, el aguacate y el huevo.', 'Cierra el sándwich y córtalo por la mitad.'], [350, 20, 36, 14], 'Recetas económicas, pp. 98–101'),
  entry('econ-hamburguesa-casera', 'Hamburguesa casera completa', 'Comida', 'Para llevar a la oficina', 25, 'Hamburguesa de ternera con tomate, lechuga y queso.', [
    ['Carne picada magra', 120], ['Pan de hamburguesa', 70, 'bread'], ['Queso', 15], ['Lechuga', 15], ['Tomate', 20, 'tomato'], ['Cebolla', 10, 'onion'], ['Salsa de yogur', 10]
  ], ['Forma la hamburguesa y cocínala a la plancha hasta el punto deseado.', 'Calienta el pan y coloca la carne con queso, tomate, lechuga y cebolla.', 'Añade una pequeña cantidad de salsa y sirve o guarda refrigerada.'], [500, 34, 46, 19], 'Recetas económicas, pp. 102–108'),
  entry('econ-hummus-clasico', 'Hummus de garbanzos con crudités', 'Snack', 'Platos fríos', 15, 'Crema clásica de garbanzos con tahini y verduras crujientes.', [
    ['Garbanzos cocidos', 120, 'chickpeas'], ['Tahini', 8], ['Zanahoria', 60, 'carrot'], ['Pepino', 40, 'cucumber'], ['Pan integral', 15, 'bread'], ['Aceite de oliva', 5, 'olive-oil'], ['Limón, ajo y comino', 4, undefined, false]
  ], ['Tritura garbanzos, tahini, limón, ajo y comino con un poco de agua.', 'Ajusta sal y textura; termina con aceite de oliva.', 'Acompaña con bastones de zanahoria, pepino y pan tostado.'], [270, 12, 29, 12], 'Recetas económicas, pp. 110–116'),
  entry('econ-pastel-atun-frio', 'Pastel frío de atún y pan', 'Cena', 'Platos fríos', 25, 'Pastel frío en capas de pan, atún, huevo y tomate.', [
    ['Atún al natural', 70, 'tuna'], ['Pan de molde integral', 60, 'bread'], ['Huevo', 50, 'egg'], ['Tomate', 50, 'tomato'], ['Maíz', 20], ['Mayonesa ligera', 15]
  ], ['Cuece el huevo y mezcla el atún con tomate picado y maíz.', 'Forma capas alternas de pan y relleno en un molde pequeño.', 'Cubre con una fina capa de mayonesa ligera y enfría antes de servir.'], [390, 25, 39, 14], 'Recetas económicas, pp. 117–120'),
  entry('econ-ensalada-patata-yogur', 'Ensalada de patata y yogur griego', 'Comida', 'Platos fríos', 30, 'Patata cocida con yogur, huevo, pepino y mostaza.', [
    ['Patata', 180, 'potato'], ['Yogur griego natural', 40, 'yogurt'], ['Huevo', 50, 'egg'], ['Pepino', 40, 'cucumber'], ['Cebolleta', 15, 'onion'], ['Aceite de oliva', 4, 'olive-oil'], ['Mostaza y perejil', 3, undefined, false]
  ], ['Cuece la patata en dados y el huevo; deja enfriar.', 'Mezcla yogur con mostaza, aceite, perejil y cebolleta picada.', 'Combina con la patata, añade pepino y huevo y sirve fría.'], [280, 12, 46, 6], 'Recetas económicas, pp. 121–125'),
  entry('econ-poke-salmon', 'Poke de salmón y arroz', 'Comida', 'Platos fríos', 25, 'Bol fresco de salmón, arroz, aguacate y verduras.', [
    ['Salmón', 100, 'salmon'], ['Arroz cocido', 100, 'rice-cooked'], ['Pepino', 40, 'cucumber'], ['Aguacate', 25, 'avocado'], ['Tomate', 20, 'tomato'], ['Salsa de soja', 5], ['Sésamo', 3]
  ], ['Cuece el arroz y enfríalo rápidamente.', 'Corta el salmón y las verduras en dados; mantén el pescado refrigerado hasta montar.', 'Sirve sobre el arroz con aguacate, soja y semillas de sésamo.'], [360, 25, 42, 11], 'Recetas económicas, pp. 126–130'),

  entry('book-tostas-tapenade', 'Tostas de queso fresco y tapenade', 'Snack', 'Platos fríos', 15, 'Tostadas con queso fresco y una pasta mediterránea de aceitunas.', [
    ['Pan integral tostado', 70, 'bread'], ['Queso fresco', 20, 'cheese'], ['Aceitunas negras', 25], ['Alcaparras', 3], ['Piñones', 2], ['Anchoa', 5], ['Ajo y zumo de naranja', 3, undefined, false]
  ], ['Tritura aceitunas, alcaparras, piñones, anchoa, ajo y unas gotas de naranja.', 'Unta una capa fina de tapenade sobre el pan tostado.', 'Añade queso fresco y sirve con perejil.'], [240, 9, 28, 11], '1000 recetas de oro, p. 12'),
  entry('book-ensalada-arroz-pollo-mango', 'Ensalada de arroz, pollo y mango', 'Comida', 'Platos fríos', 35, 'Ensalada fría de arroz con pollo especiado, mango, anacardos y menta.', [
    ['Arroz seco', 100, 'rice-dry'], ['Pechuga de pollo', 110, 'chicken'], ['Jamón de pato', 25], ['Mango', 60], ['Anacardos', 6], ['Aceite de oliva', 5, 'olive-oil'], ['Miel y vinagreta', 5, undefined, false], ['Canela, menta y pimienta', 2, undefined, false]
  ], ['Marina el pollo en dados con canela, pimienta y unas gotas de aceite.', 'Cuece el arroz, enfríalo y mezcla con menta picada, mango, anacardos y jamón.', 'Saltea el pollo hasta que esté bien hecho, añádelo al bol y termina con una vinagreta ligera.'], [520, 33, 67, 12], '1000 recetas de oro, pp. 87–88'),
  entry('book-champinones-vino', 'Champiñones en salsa de vino', 'Cena', 'Platos elaborados', 25, 'Champiñones salteados con cebolla, ajo y salsa de vino.', [
    ['Champiñones', 200], ['Cebolla', 30, 'onion'], ['Ajo', 3, undefined, false], ['Harina', 5], ['Vino blanco', 35], ['Aceite de oliva', 5, 'olive-oil'], ['Perejil y guindilla', 2, undefined, false]
  ], ['Sofríe la cebolla y el ajo con aceite.', 'Añade champiñones limpios y cocina hasta que suelten el agua.', 'Espolvorea harina, vierte vino y un poco de agua y cocina hasta que la salsa espese.'], [135, 7, 15, 6], '1000 recetas de oro, p. 45'),
  entry('book-ensaladilla-salmon', 'Ensaladilla de patata, salmón y aguacate', 'Comida', 'Platos fríos', 30, 'Ensaladilla fresca de patata con salmón, aguacate y huevo.', [
    ['Patata', 150, 'potato'], ['Salmón fresco', 40, 'salmon'], ['Salmón ahumado', 40], ['Aguacate', 40, 'avocado'], ['Huevo', 40, 'egg'], ['Mayonesa ligera', 12], ['Cebollino', 2, undefined, false]
  ], ['Cuece la patata y el huevo; deja enfriar y corta en dados.', 'Cocina el salmón fresco y desmenúzalo. Añade el salmón ahumado y el aguacate.', 'Mezcla con una pequeña cantidad de mayonesa ligera y enfría antes de servir.'], [360, 24, 36, 13], '1000 recetas de oro, pp. 51–52'),
  entry('book-ensalada-calabacin-champinon', 'Ensalada de champiñones y calabacín', 'Cena', 'Platos fríos', 15, 'Ensalada templada de calabacín, champiñones, tomate y granada.', [
    ['Calabacín', 120], ['Champiñones', 90], ['Tomate cherry', 60, 'tomato'], ['Granada', 30], ['Piñones', 8], ['Aceite de oliva', 7, 'olive-oil'], ['Limón y tomillo', 3, undefined, false]
  ], ['Saltea el calabacín y los champiñones en una sartén caliente.', 'Mezcla con tomates cherry y granada.', 'Aliña con aceite, limón y tomillo; termina con piñones tostados.'], [220, 8, 20, 12], '1000 recetas de oro, p. 52'),
  entry('book-ensalada-lentejas-langostinos', 'Ensalada templada de lentejas y langostinos', 'Comida', 'Platos fríos', 30, 'Lentejas templadas con langostinos, espárragos y ajo fresco.', [
    ['Lentejas cocidas', 125, 'lentils'], ['Langostinos', 60], ['Espárragos verdes', 50], ['Ajos tiernos', 25], ['Aceite de oliva', 6, 'olive-oil'], ['Limón y perejil', 3, undefined, false]
  ], ['Cuece las lentejas hasta que estén tiernas y escúrrelas.', 'Saltea los langostinos, los espárragos y los ajos tiernos.', 'Mezcla con las lentejas y aliña con aceite, limón y perejil.'], [350, 24, 42, 8], '1000 recetas de oro, pp. 55–56'),
  entry('book-porrusalda', 'Porrusalda de puerro y patata', 'Comida', 'Platos de cuchara', 35, 'Caldo suave de puerro, patata, zanahoria y cebolla.', [
    ['Puerro', 150], ['Patata', 125, 'potato'], ['Zanahoria', 40, 'carrot'], ['Cebolla', 30, 'onion'], ['Caldo de pollo', 250], ['Aceite de oliva', 5, 'olive-oil'], ['Perejil', 2, undefined, false]
  ], ['Pocha la cebolla en una cazuela con aceite, sin que llegue a dorarse.', 'Añade puerro, zanahoria y patata troceados; cubre con caldo.', 'Cuece hasta que las verduras estén tiernas y sirve caliente.'], [280, 7, 48, 8], '1000 recetas de oro, p. 138'),
  entry('book-paella-pescado-marisco', 'Paella de pescado y marisco', 'Comida', 'Platos elaborados', 45, 'Arroz con rape, gambas y mejillones en un caldo aromático.', [
    ['Arroz seco', 75, 'rice'], ['Gambas', 38], ['Rape', 75], ['Mejillones', 80], ['Pimiento verde', 30, 'pepper'], ['Pimiento rojo', 20, 'pepper'], ['Tomate', 35, 'tomato'], ['Caldo de pescado', 220], ['Aceite de oliva', 5, 'olive-oil'], ['Ajo y azafrán', 3, undefined, false]
  ], ['Saltea las gambas y el rape con aceite; retira y reserva. Abre los mejillones al vapor.', 'Sofríe ajo, pimientos y tomate; añade el arroz y mezcla.', 'Vierte caldo caliente y cocina hasta que el arroz esté hecho. Incorpora el marisco y deja reposar.'], [480, 34, 63, 8], '1000 recetas de oro, pp. 430–431'),
  entry('book-puerros-romesco', 'Puerros con salsa romesco', 'Comida', 'Platos fríos', 25, 'Puerros tiernos servidos con salsa romesco de tomate y frutos secos.', [
    ['Puerro', 180], ['Tomate asado', 60, 'tomato'], ['Almendras', 10], ['Avellanas', 5], ['Pan tostado', 8, 'bread'], ['Aceite de oliva', 8, 'olive-oil'], ['Ajo, vinagre y ñora', 3, undefined, false]
  ], ['Cuece o asa los puerros hasta que estén tiernos y deja que se templen.', 'Tritura tomate asado, frutos secos, pan, ajo, ñora, vinagre y aceite.', 'Sirve los puerros con la salsa romesco por encima.'], [245, 6, 27, 13], '1000 recetas de oro, p. 448'),
  entry('book-setas-gratinadas', 'Setas gratinadas con bechamel', 'Cena', 'Platos elaborados', 30, 'Setas salteadas cubiertas con bechamel ligera y gratinadas.', [
    ['Setas variadas', 375], ['Leche semidesnatada', 150, 'milk'], ['Harina', 15], ['Cebolleta', 25, 'onion'], ['Ajo', 3, undefined, false], ['Aceite de oliva', 6, 'olive-oil'], ['Perejil y sal', 2, undefined, false]
  ], ['Sofríe la cebolleta y el ajo; añade las setas troceadas y cocínalas hasta que pierdan agua.', 'Aparte, tuesta la harina y añade la leche poco a poco, removiendo hasta obtener una bechamel ligera.', 'Cubre las setas con bechamel y gratina hasta que la superficie se dore.'], [335, 18, 44, 9], '1000 recetas de oro, pp. 27–28'),
  entry('book-aguacate-salmon', 'Aguacate relleno de salmón', 'Cena', 'Platos fríos', 15, 'Aguacate relleno de salmón ahumado y hojas frescas.', [
    ['Aguacate', 120, 'avocado'], ['Salmón ahumado', 50], ['Escarola', 25], ['Huevo', 25, 'egg'], ['Yogur natural', 20], ['Limón y perejil', 3, undefined, false]
  ], ['Cuece el huevo y pícalo. Parte el aguacate, retira el hueso y extrae parte de la pulpa.', 'Mezcla la pulpa con salmón, huevo, yogur y unas gotas de limón.', 'Rellena las mitades y sirve sobre hojas de escarola.'], [390, 22, 20, 28], '1000 recetas de oro, p. 34'),
  entry('book-mejillones-picantes', 'Mejillones en salsa de tomate picante', 'Cena', 'Platos elaborados', 30, 'Mejillones abiertos al vapor con una salsa de tomate ligeramente picante.', [
    ['Mejillones', 250], ['Tomate', 150, 'tomato'], ['Puerro', 20], ['Cebolla', 20, 'onion'], ['Vino blanco', 25], ['Aceite de oliva', 5, 'olive-oil'], ['Guindilla y perejil', 2, undefined, false]
  ], ['Abre los mejillones con vino blanco en una cazuela tapada y reserva el líquido.', 'Sofríe puerro y cebolla; añade tomate y guindilla y cocina hasta que reduzca.', 'Agrega los mejillones y un poco de su líquido, calienta unos minutos y sirve.'], [270, 24, 24, 9], '1000 recetas de oro, p. 37'),
  entry('book-quinoa-verduras', 'Quinoa con verduras y salsa de tomate asado', 'Comida', 'Platos elaborados', 35, 'Quinoa con verduras salteadas y una salsa de tomate y ajo asados.', [
    ['Quinoa seca', 63], ['Tomate', 50, 'tomato'], ['Puerro', 35], ['Zanahoria', 25, 'carrot'], ['Calabacín', 35], ['Pimiento verde', 25, 'pepper'], ['Mayonesa ligera', 15], ['Aceite de oliva', 5, 'olive-oil'], ['Ajo y perejil', 3, undefined, false]
  ], ['Asa el tomate y el ajo; tritúralos y mezcla con una pequeña cantidad de mayonesa ligera.', 'Corta las verduras en dados y saltéalas con aceite.', 'Enjuaga la quinoa, añádela a las verduras y cuece con agua hasta que esté tierna. Sirve con la salsa.'], [420, 13, 59, 14], '1000 recetas de oro, pp. 149–150'),
  entry('book-calabacines-rellenos', 'Calabacines rellenos de carne', 'Comida', 'Platos elaborados', 40, 'Calabacines pequeños rellenos de carne picada, tomate y hierbas.', [
    ['Calabacín', 150], ['Carne picada magra', 67], ['Cebolleta', 25, 'onion'], ['Tomate', 50, 'tomato'], ['Alcaparras', 3], ['Aceite de oliva', 5, 'olive-oil'], ['Tomillo y perejil', 2, undefined, false]
  ], ['Corta la parte superior de los calabacines, vacía el interior y cuécelos unos minutos.', 'Pocha la cebolleta con la pulpa del calabacín y el tomate; añade carne y tomillo.', 'Rellena los calabacines y gratina brevemente. Sirve con una salsa ligera de tomate y alcaparras.'], [270, 21, 20, 12], '1000 recetas de oro, pp. 158–159'),
  entry('book-ratatouille', 'Ratatouille de verduras al horno', 'Comida', 'Platos elaborados', 50, 'Berenjena, calabacín y tomate horneados sobre una base de verduras.', [
    ['Berenjena', 75], ['Calabacín', 50], ['Tomate', 50, 'tomato'], ['Zanahoria', 35, 'carrot'], ['Cebolla', 40, 'onion'], ['Salsa de tomate', 100, 'tomato'], ['Aceite de oliva', 8, 'olive-oil'], ['Ajo y hierbas provenzales', 3, undefined, false]
  ], ['Pocha la cebolla y la zanahoria rallada; añade ajo y salsa de tomate y cocina unos minutos.', 'Corta berenjena, calabacín y tomate en rodajas y colócalos en capas sobre la salsa.', 'Añade hierbas y aceite y hornea hasta que las verduras estén tiernas.'], [190, 5, 29, 8], '1000 recetas de oro, pp. 197–198'),
  entry('book-arroz-pollo-cerdo-marisco', 'Arroz con pollo, cerdo y langostinos', 'Comida', 'Platos elaborados', 50, 'Arroz sabroso con pollo, costilla, calamar y langostinos.', [
    ['Arroz seco', 55, 'rice-dry'], ['Pollo', 60, 'chicken'], ['Costilla de cerdo', 45], ['Langostinos', 30], ['Calamar', 45], ['Guisantes', 35], ['Caldo de pescado', 200], ['Pimiento verde', 25, 'pepper'], ['Tomate', 35, 'tomato'], ['Aceite de oliva', 5, 'olive-oil']
  ], ['Dora el pollo y la costilla; añade calamar en dados.', 'Agrega puerro, pimiento, ajo y tomate; incorpora arroz y caldo caliente.', 'Cuando el arroz esté casi hecho, añade langostinos y guisantes. Deja reposar antes de servir.'], [590, 43, 68, 15], '1000 recetas de oro, pp. 431–432'),
  entry('book-ensalada-tomate-salmon', 'Ensalada de tomate, pimientos y salmón', 'Cena', 'Platos fríos', 25, 'Ensalada tibia de tomate, pimiento, acelga y salmón ahumado.', [
    ['Tomate', 120, 'tomato'], ['Pimiento verde', 90, 'pepper'], ['Acelga', 35], ['Salmón ahumado', 50], ['Yogur natural', 25], ['Aceite de oliva', 6, 'olive-oil'], ['Ajo, albahaca y mostaza', 4, undefined, false]
  ], ['Hornea gajos de tomate con unas gotas de aceite.', 'Saltea el pimiento y la acelga hasta que estén tiernos.', 'Mezcla yogur, ajo, albahaca, mostaza y vinagre para el aliño; sirve con el salmón ahumado.'], [255, 18, 18, 12], '1000 recetas de oro, pp. 62–63')
]
