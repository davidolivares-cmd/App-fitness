export type ExerciseCategory = 'Tren inferior' | 'Tren superior' | 'Cardio'

export type Exercise = {
  id: string
  name: string
  category: ExerciseCategory
  muscle: string
  equipment: string
  detail: string
  imageIndex: number
  sets: number
  reps: number
}

const lower: Array<[string, string, string]> = [
  ['Sentadilla con barra', 'Cuádriceps y glúteos', 'Barra'], ['Sentadilla goblet', 'Piernas y glúteos', 'Mancuerna'], ['Sentadilla frontal', 'Cuádriceps y core', 'Barra'], ['Sentadilla hack', 'Cuádriceps', 'Máquina hack'], ['Prensa de piernas', 'Cuádriceps y glúteos', 'Prensa'], ['Peso muerto convencional', 'Cadena posterior', 'Barra'], ['Peso muerto rumano', 'Isquiotibiales y glúteos', 'Barra o mancuernas'], ['Peso muerto sumo', 'Glúteos y aductores', 'Barra'], ['Hip thrust con barra', 'Glúteos', 'Barra y banco'], ['Puente de glúteos', 'Glúteos', 'Peso corporal'], ['Zancada hacia delante', 'Piernas y glúteos', 'Peso corporal o mancuernas'], ['Zancada hacia atrás', 'Piernas y glúteos', 'Peso corporal o mancuernas'], ['Zancada caminando', 'Piernas y glúteos', 'Peso corporal o mancuernas'], ['Sentadilla búlgara', 'Cuádriceps y glúteos', 'Banco y mancuernas'], ['Step-up al cajón', 'Piernas y glúteos', 'Cajón'], ['Extensión de piernas', 'Cuádriceps', 'Máquina'], ['Curl femoral sentado', 'Isquiotibiales', 'Máquina'], ['Curl femoral tumbado', 'Isquiotibiales', 'Máquina'], ['Abducción de cadera', 'Glúteo medio', 'Máquina'], ['Aducción de cadera', 'Aductores', 'Máquina'], ['Patada de glúteo en polea', 'Glúteos', 'Polea'], ['Elevación de gemelos de pie', 'Gemelos', 'Máquina o peso corporal'], ['Elevación de gemelos sentado', 'Gemelos', 'Máquina'], ['Buenos días con barra', 'Isquiotibiales y espalda', 'Barra'], ['Peso muerto a una pierna', 'Glúteos e isquiotibiales', 'Peso corporal o mancuerna']
]

const upper: Array<[string, string, string]> = [
  ['Press de banca con barra', 'Pecho y tríceps', 'Barra y banco'], ['Press inclinado con mancuernas', 'Pecho y tríceps', 'Mancuernas y banco'], ['Press declinado', 'Pecho y tríceps', 'Barra o máquina'], ['Aperturas con mancuernas', 'Pecho', 'Mancuernas y banco'], ['Cruce de poleas', 'Pecho', 'Poleas'], ['Flexiones', 'Pecho, hombros y tríceps', 'Peso corporal'], ['Press militar con barra', 'Hombros y tríceps', 'Barra'], ['Press de hombros sentado', 'Hombros y tríceps', 'Mancuernas o máquina'], ['Elevaciones laterales', 'Deltoides lateral', 'Mancuernas'], ['Elevaciones frontales', 'Deltoides anterior', 'Mancuernas'], ['Pájaros para deltoides posterior', 'Deltoides posterior', 'Mancuernas'], ['Face pull', 'Deltoides posterior y espalda', 'Polea'], ['Encogimientos con mancuernas', 'Trapecio', 'Mancuernas'], ['Jalón al pecho', 'Espalda y bíceps', 'Polea'], ['Dominadas', 'Espalda y bíceps', 'Barra de dominadas'], ['Remo con barra', 'Espalda y bíceps', 'Barra'], ['Remo con mancuerna a una mano', 'Espalda y bíceps', 'Mancuerna y banco'], ['Remo sentado en polea', 'Espalda y bíceps', 'Polea'], ['Pullover con mancuerna', 'Pecho y espalda', 'Mancuerna y banco'], ['Curl de bíceps con barra', 'Bíceps', 'Barra'], ['Curl martillo', 'Bíceps y antebrazo', 'Mancuernas'], ['Curl en banco inclinado', 'Bíceps', 'Mancuernas y banco'], ['Extensión de tríceps en polea', 'Tríceps', 'Polea'], ['Fondos en paralelas', 'Tríceps y pecho', 'Barras paralelas'], ['Press francés', 'Tríceps', 'Barra o mancuernas']
]

const cardio: Array<[string, string, string]> = [
  ['Cinta de correr', 'Cardiovascular', 'Cinta'], ['Caminar en cinta con inclinación', 'Cardiovascular', 'Cinta'], ['Bicicleta estática', 'Cardiovascular', 'Bicicleta'], ['Bicicleta reclinada', 'Cardiovascular', 'Bicicleta reclinada'], ['Bicicleta de spinning', 'Cardiovascular', 'Bicicleta de spinning'], ['Elíptica', 'Cardiovascular', 'Elíptica'], ['Máquina de remo', 'Cardiovascular y cuerpo completo', 'Remo ergómetro'], ['Escaladora', 'Cardiovascular y piernas', 'Escaladora'], ['Subida al cajón', 'Cardiovascular y piernas', 'Cajón'], ['Saltos de comba', 'Cardiovascular y pantorrillas', 'Comba'], ['Jumping jacks', 'Cardiovascular y cuerpo completo', 'Peso corporal'], ['Burpees', 'Cardiovascular y cuerpo completo', 'Peso corporal'], ['Mountain climbers', 'Cardiovascular y core', 'Peso corporal'], ['Saltos de sentadilla', 'Cardiovascular y piernas', 'Peso corporal'], ['Skaters laterales', 'Cardiovascular y piernas', 'Peso corporal'], ['Sprint en bicicleta de aire', 'Cardiovascular y cuerpo completo', 'Bicicleta de aire'], ['Empuje de trineo', 'Cardiovascular y piernas', 'Trineo'], ['Battle ropes', 'Cardiovascular y tren superior', 'Cuerdas'], ['Caminata del granjero', 'Agarre, core y cardiovascular', 'Mancuernas o kettlebells'], ['Boxeo con saco', 'Cardiovascular y tren superior', 'Saco de boxeo'], ['Natación', 'Cardiovascular y cuerpo completo', 'Piscina'], ['Caminata rápida', 'Cardiovascular', 'Exterior o cinta'], ['Carrera por intervalos', 'Cardiovascular', 'Exterior o cinta'], ['Step en plataforma', 'Cardiovascular y piernas', 'Plataforma'], ['Shadow boxing', 'Cardiovascular y tren superior', 'Peso corporal']
]

const repeat = (count: number, detail: string) => Array.from({ length: count }, () => detail)
const lowerDetails = [
  ...repeat(3, 'Mantén el tronco activo. Baja siguiendo la dirección de los pies y sube empujando el suelo.'),
  ...repeat(2, 'Ajusta la máquina para que el eje coincida con la rodilla. Haz el recorrido con control y sin rebotes.'),
  ...repeat(3, 'Mantén la espalda neutra y el abdomen firme. Lleva la cadera atrás y vuelve extendiéndola sin tirar de la zona lumbar.'),
  ...repeat(2, 'Apoya bien los pies y mantén la barbilla recogida. Eleva la pelvis contrayendo los glúteos y baja sin arquear la espalda.'),
  ...repeat(4, 'Estabiliza el tronco y conserva la pelvis nivelada. Alinea la rodilla delantera con el pie y controla el equilibrio.'),
  'Usa un cajón firme y apoya el pie completo. Sube sin tomar impulso y baja despacio.',
  'Ajusta la máquina para que el eje coincida con la rodilla. Controla el recorrido y evita bloquear la articulación.',
  ...repeat(2, 'Alinea la rodilla con el eje y ajusta los rodillos. Flexiona las piernas y regresa lentamente.'),
  ...repeat(2, 'Siéntate estable y mueve las piernas desde la cadera. Regresa lentamente manteniendo tensión.'),
  'Lleva la pierna hacia atrás sin arquear la espalda. Regresa despacio evitando que el cable tire de ella.',
  ...repeat(2, 'Apoya la parte delantera de los pies. Eleva los talones sin rebotar y baja hasta un estiramiento cómodo.'),
  'Mantén la espalda neutra. Lleva la cadera atrás y vuelve extendiéndola sin tirar de la zona lumbar.',
  'Apóyate sobre una pierna, inclina el tronco desde la cadera y vuelve manteniendo el equilibrio.'
]
const upperDetails = [
  ...repeat(3, 'Estabiliza los pies y los omóplatos. Baja la carga hacia el pecho y empuja con control, sin rebotar.'),
  ...repeat(2, 'Mantén una flexión suave en los codos. Abre y cierra los brazos en un arco controlado y cómodo.'),
  'Alinea cabeza, cadera y talones. Baja el pecho con control y empuja el suelo sin hundir la zona lumbar.',
  ...repeat(2, 'Activa abdomen y glúteos. Empuja verticalmente con las muñecas estables y baja con control.'),
  ...repeat(3, 'Eleva los brazos sin impulso, con ligera flexión de codos y hasta un rango cómodo.'),
  'Tira de la polea hacia la frente separando las manos y llevando los codos atrás; regresa despacio.',
  'Eleva los hombros hacia las orejas sin girarlos y baja completamente con control.',
  ...repeat(2, 'Fija los muslos y lleva los codos hacia abajo. Controla el retorno y evita tirar tras la nuca.'),
  ...repeat(3, 'Mantén la espalda neutra. Lleva los codos hacia atrás y la carga hacia el torso; extiende lentamente.'),
  'Túmbate estable y lleva los brazos atrás con los codos suaves; vuelve sobre el pecho sin arquear la espalda.',
  ...repeat(3, 'Mantén los codos cerca del cuerpo y los hombros relajados. Flexiona sin balancearte y baja lentamente.'),
  ...repeat(3, 'Mantén los codos estables. Extiende con control y evita bloquear las articulaciones con brusquedad.')
]
const cardioDetails = [
  'Empieza gradualmente, mantén la mirada al frente y usa una zancada natural. Termina bajando el ritmo.',
  'Camina erguido y con pasos cómodos. Ajusta ritmo e inclinación para conservar la postura.',
  ...repeat(3, 'Ajusta el asiento para que la rodilla quede ligeramente flexionada. Pedalea de forma fluida y aumenta la resistencia poco a poco.'),
  'Apoya los pies completos y coordina brazos y piernas con un ritmo continuo; mantén el tronco erguido.',
  'Empuja primero con las piernas, abre el tronco y tira del asa. Vuelve en orden inverso.',
  'Sube los peldaños con pasos firmes y controlados. Mantén el tronco erguido y un ritmo cómodo.',
  'Usa un cajón firme, apoya el pie completo y baja despacio después de subir.',
  'Gira la cuerda desde las muñecas, salta bajo y aterriza suavemente.',
  'Separa y junta los pies con un aterrizaje suave y las rodillas flexibles.',
  'Lleva los pies atrás a una plancha firme, vuelve bajo la cadera y ponte de pie con control.',
  'Desde una plancha alta, alterna las rodillas hacia el pecho sin elevar demasiado la cadera.',
  'Salta desde una sentadilla cómoda y aterriza suavemente antes de repetir.',
  'Salta de lado a lado, flexiona la pierna de apoyo y controla el equilibrio.',
  'Pedalea con energía mientras empujas y tiras de las manillas; usa intervalos controlados.',
  'Inclina el tronco en bloque y empuja con pasos potentes sin perder la postura.',
  'Crea ondas alternas con las cuerdas y mantén el tronco firme y los hombros relajados.',
  'Camina erguido con una carga en cada mano, pasos cortos y abdomen activo.',
  'Golpea con control y rota suavemente la cadera. Recoge cada golpe con las muñecas alineadas.',
  'Mantén el cuerpo horizontal y coordina brazada, patada y respiración a un ritmo cómodo.',
  'Camina erguido, con pasos cómodos y apoyos controlados.',
  'Empieza gradualmente, aumenta el ritmo por intervalos y termina bajando la intensidad.',
  'Apoya el pie completo en la plataforma, sube sin impulso y baja despacio.',
  'Adopta una guardia estable, golpea con control y recoge cada golpe manteniendo las muñecas alineadas.'
]

const createGroup = (items: Array<[string, string, string]>, category: Exercise['category'], startIndex: number, details: string[]): Exercise[] => items.map(([name, muscle, equipment], index) => ({
  id: `${category === 'Tren inferior' ? 'inferior' : category === 'Tren superior' ? 'superior' : 'cardio'}-${String(index + 1).padStart(2, '0')}`,
  name,
  category,
  muscle,
  equipment,
  detail: details[index],
  imageIndex: startIndex + index,
  sets: category === 'Cardio' ? 1 : 3,
  reps: category === 'Cardio' ? 20 : 12
}))

export const exerciseCatalog: Exercise[] = [
  ...createGroup(lower, 'Tren inferior', 0, lowerDetails),
  ...createGroup(upper, 'Tren superior', 25, upperDetails),
  ...createGroup(cardio, 'Cardio', 50, cardioDetails)
]
