const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const mealTypes = ['Desayuno', 'Comida', 'Cena', 'Snack'] as const
const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } })

const foodSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    name: { type: 'string' },
    caloriesPer100g: { type: 'number' },
    proteinPer100g: { type: 'number' },
    carbsPer100g: { type: 'number' },
    fatPer100g: { type: 'number' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    note: { type: 'string' },
  },
  required: ['name', 'caloriesPer100g', 'proteinPer100g', 'carbsPer100g', 'fatPer100g', 'confidence', 'note'],
}

const recipesSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    recipes: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: mealTypes },
          minutes: { type: 'integer' },
          description: { type: 'string' },
          ingredients: {
            type: 'array', items: {
              type: 'object', additionalProperties: false,
              properties: {
                name: { type: 'string' }, grams: { type: 'number' },
                caloriesPer100g: { type: 'number' }, proteinPer100g: { type: 'number' },
                carbsPer100g: { type: 'number' }, fatPer100g: { type: 'number' },
              },
              required: ['name', 'grams', 'caloriesPer100g', 'proteinPer100g', 'carbsPer100g', 'fatPer100g'],
            },
          },
          steps: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'type', 'minutes', 'description', 'ingredients', 'steps'],
      },
    },
  },
  required: ['recipes'],
}

function toGeminiSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toGeminiSchema)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'additionalProperties').map(([key, nested]) => [
    key,
    toGeminiSchema(nested),
  ]))
}

async function askGemini(apiKey: string, model: string, schema: Record<string, unknown>, instructions: string, input: string, maxTokens: number) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instructions }] },
      contents: [{ role: 'user', parts: [{ text: input }] }],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: maxTokens,
        thinkingConfig: { thinkingLevel: 'LOW' },
        responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: toGeminiSchema(schema) } },
      },
    }),
  })
  if (!response.ok) {
    const providerError = await response.json().catch(() => ({}))
    const providerMessage = typeof providerError?.error?.message === 'string' ? providerError.error.message.slice(0, 300) : 'No provider message'
    const providerStatus = typeof providerError?.error?.status === 'string' ? providerError.error.status : 'unknown'
    console.error('Gemini request failed', response.status, providerStatus, providerMessage)
    throw new Error('Gemini provider request failed (' + response.status + ')')
  }
  const result = await response.json()
  const parts = result?.candidates?.[0]?.content?.parts
  const content = Array.isArray(parts) ? parts.filter((part) => part?.thought !== true).map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim() : ''
  if (!content.trim()) throw new Error('Gemini returned no content (' + (result?.candidates?.[0]?.finishReason || 'unknown') + ')')
  const unfenced = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = unfenced.indexOf('{')
  const end = unfenced.lastIndexOf('}')
  const json = start >= 0 && end > start ? unfenced.slice(start, end + 1) : unfenced
  return JSON.parse(json) as Record<string, unknown>
}

function numbersAreValid(values: unknown[]) {
  return values.every((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1000)
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Método no permitido.' }, 405)

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) return jsonResponse({ error: 'La función no tiene configurada la clave del proveedor de IA.' }, 503)
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-flash-latest'

  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return jsonResponse({ error: 'Solicitud no válida.' }, 400)
    body = parsed as Record<string, unknown>
  } catch {
    return jsonResponse({ error: 'El cuerpo de la solicitud no es JSON válido.' }, 400)
  }

  try {
    if (body.action === 'food') {
      const foodName = typeof body.foodName === 'string' ? body.foodName.trim().slice(0, 120) : ''
      const grams = Number(body.grams)
      if (!foodName || !Number.isFinite(grams) || grams < 1 || grams > 5000) return jsonResponse({ error: 'Indica un alimento y un peso entre 1 y 5000 g.' }, 400)
      const result = await askGemini(apiKey, model, foodSchema,
        'Eres un asistente de nutrición. Da una estimación aproximada por cada 100 g del alimento descrito. Usa valores medios fiables para la forma de preparación indicada. No inventes precisión de marca. Si hay varias interpretaciones, elige la más habitual y explica la incertidumbre en una nota breve en español. No des consejos médicos. Los macros deben ser plausibles y no negativos. Devuelve solo el objeto JSON solicitado, sin Markdown ni texto adicional.',
        JSON.stringify({ foodName, portionGrams: grams }), 1200)
      const values = [result.caloriesPer100g, result.proteinPer100g, result.carbsPer100g, result.fatPer100g]
      if (typeof result.name !== 'string' || !numbersAreValid(values) || !['low', 'medium', 'high'].includes(String(result.confidence)) || typeof result.note !== 'string') return jsonResponse({ error: 'La estimación recibida no es válida. Inténtalo con un nombre más concreto.' }, 502)
      return jsonResponse(result)
    }

    if (body.action === 'recipes') {
      const ingredients = Array.isArray(body.ingredients) ? body.ingredients.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 80)).filter(Boolean).slice(0, 20) : []
      const mealType = body.mealType === 'Cualquiera' || mealTypes.includes(body.mealType as typeof mealTypes[number]) ? body.mealType : 'Cualquiera'
      const maxCalories = Number(body.maxCalories)
      if (ingredients.length < 2 || !Number.isFinite(maxCalories) || maxCalories < 100 || maxCalories > 2000) return jsonResponse({ error: 'Indica al menos dos ingredientes y un límite de 100 a 2000 kcal.' }, 400)
      const result = await askGemini(apiKey, model, recipesSchema,
        'Eres un cocinero práctico que crea recetas realistas en español. Propón como máximo tres recetas distintas; cada receta debe utilizar al menos dos de los ingredientes que la persona tiene. Prioriza los ingredientes aportados y etiqueta los ingredientes adicionales en la lista (la aplicación calculará cuáles faltan). Puedes asumir sal, pimienta y agua como básicos, pero no los incluyas en la tabla nutricional. Mantén cada ración dentro del máximo calórico solicitado. Indica gramos por ración, valores nutricionales aproximados por 100 g para cada ingrediente, pasos claros y tiempos realistas. Evita combinaciones extrañas, cantidades improbables y afirmaciones médicas. Respeta el tipo de comida pedido cuando no sea “Cualquiera”. Devuelve solo el objeto JSON solicitado, sin Markdown ni texto adicional.',
        JSON.stringify({ ingredients, mealType, maximumCaloriesPerServing: maxCalories, prioritizeProtein: body.prioritizeProtein === true }), 5000)
      const recipes = Array.isArray(result.recipes) ? result.recipes.filter((recipe) => {
        if (!recipe || typeof recipe !== 'object') return false
        const candidate = recipe as Record<string, unknown>
        if (typeof candidate.name !== 'string' || !mealTypes.includes(candidate.type as typeof mealTypes[number]) || !Array.isArray(candidate.ingredients) || candidate.ingredients.length < 2 || !Array.isArray(candidate.steps) || candidate.steps.length < 3) return false
        return (candidate.ingredients as Array<Record<string, unknown>>).every((item) => typeof item.name === 'string' && item.name.length <= 100 && typeof item.grams === 'number' && Number.isFinite(item.grams) && item.grams > 0 && numbersAreValid([item.caloriesPer100g, item.proteinPer100g, item.carbsPer100g, item.fatPer100g]))
      }).slice(0, 3) : []
      return jsonResponse({ recipes })
    }

    return jsonResponse({ error: 'Acción no reconocida.' }, 400)
  } catch (error) {
    console.error('Forma AI processing failed', error instanceof Error ? error.message : 'Unknown error')
    return jsonResponse({ error: 'No se pudo completar la consulta de IA. Inténtalo de nuevo.' }, 502)
  }
})

