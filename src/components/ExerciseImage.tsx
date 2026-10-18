export function ExerciseImage({ index, name, image }: { index: number; name: string; image?: string }) {
  const col = index % 5, row = Math.floor(index / 5)
  const imageUrl = image ?? `${import.meta.env.BASE_URL}exercises/exercise-sprite-v3.webp`
  return <div className="exercise-art exercise-photo" role="img" aria-label={`Fotografía de ${name}`} style={{ backgroundImage: `url("${imageUrl}")`, backgroundPosition: image ? 'center' : `${col / 4 * 100}% ${row / 14 * 100}%`, backgroundSize: image ? 'contain' : '500% 1500%', backgroundRepeat: 'no-repeat' }} />
}
