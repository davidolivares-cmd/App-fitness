export type ShoppingListSourceItem = { name: string; grams: number }
export type ShoppingListItem = { key: string; name: string; grams: number }

export function buildShoppingList(items: ShoppingListSourceItem[]): ShoppingListItem[] {
  const grouped = new Map<string, ShoppingListItem>()
  for (const item of items) {
    if (!item.name.trim() || !Number.isFinite(item.grams) || item.grams <= 0) continue
    const normalized = item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim().replace(/\s+/g, ' ')
    const key = normalized.replace(/\b([a-záéíóúñ]{4,})s\b/g, '$1')
    const current = grouped.get(key)
    if (current) current.grams += item.grams
    else grouped.set(key, { key, name: item.name.trim(), grams: item.grams })
  }
  return [...grouped.values()].map((item) => ({ ...item, grams: Math.round(item.grams * 10) / 10 })).sort((a, b) => a.name.localeCompare(b.name, 'es'))
}
