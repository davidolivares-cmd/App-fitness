# Forma

Forma es una aplicación privada y adaptable de entrenamiento y nutrición, creada con React, TypeScript, Vite y Supabase.

## Run locally

Requisitos: Node.js 22 o superior y npm.

```sh
npm install
npm run dev
```

Configura los valores públicos del proyecto Supabase en un archivo `.env.local` ignorado por Git:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

No incluyas una clave `service_role` de Supabase ni secretos del proveedor de IA en el código del navegador.

## Datos privados de la cuenta

Ejecuta la migración `supabase/migrations/202610170001_forma_private_data.sql` en el proyecto Supabase de la aplicación. Crea `forma_user_data` con políticas RLS por propietario y el bucket privado `recipe-photos` con políticas de almacenamiento por usuario.

Puedes aplicarla con Supabase CLI (`supabase db push`) o desde el editor SQL de Supabase. Sin la migración, el inicio de sesión funciona, pero los datos nuevos no se sincronizan con la cuenta; la app muestra ese estado en lugar de afirmar que se guardaron.

## Nutrición y progreso

Los valores de alimentos son estimaciones por 100 g y se pueden introducir manualmente cuando falten en el catálogo. El objetivo calórico usa la estimación Mifflin–St Jeor, un factor de actividad y un ajuste moderado según el objetivo; también se puede introducir manualmente. El IMC se muestra como indicador orientativo, no como diagnóstico. El primer perfil crea un registro inicial de peso; los siguientes pueden incluir cintura, pecho, cadera, brazo y muslo.

## Recordatorios e ideas de recetas

La app solicita permiso de notificaciones solo después de que la persona pulse el botón de activación. El recordatorio comprueba si toca registrar el progreso al abrir Forma. Los avisos con la app cerrada requieren un servicio push y un planificador de servidor, que no están configurados.

Las recetas aleatorias y la búsqueda por ingredientes usan el catálogo local. La estimación nutricional de alimentos fuera del catálogo utiliza la función Edge `forma-ai` de Supabase, que llama a Google Gemini. La función requiere el secreto `GEMINI_API_KEY` en Supabase; no lo pongas en GitHub Pages ni en variables del navegador. También puede configurarse `GEMINI_MODEL`; por defecto usa `gemini-flash-latest`.

Despliega la función en el proyecto Supabase de Forma y configura el secreto:

```sh
supabase secrets set GEMINI_API_KEY=your-key
supabase functions deploy forma-ai
```

Until the function is deployed with a valid Gemini key, the rest of the app works and AI controls show an error. AI food values and recipes are estimates; check food labels, ingredients, quantities, allergens and preparation before relying on them.

La página de progreso incluye un gráfico seleccionable de medidas y un calendario mensual. Marca como realizado un entrenamiento desde el calendario semanal para registrarlo.

## Catálogo de ejercicios

Los nombres, instrucciones e ilustraciones del catálogo de ejercicios están en `src/data/exercises.ts` y `public/exercises/exercise-sprite-v2.webp`. Las imágenes son ilustraciones, no fotografías.

## Pruebas, compilación y publicación

```sh
npm run build
npm run preview
```

Las pruebas de reglas nutricionales usan el ejecutor integrado de Node.js:

```sh
npm test
```

GitHub Actions compila las solicitudes de cambio sin publicarlas. Un push a `main` o la ejecución manual del flujo compila y publica GitHub Pages. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` como variables de Actions.
