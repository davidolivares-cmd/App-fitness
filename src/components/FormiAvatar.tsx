// HEMOS ELIMINADO EL 'import React from "react"' PARA EVITAR EL ERROR DE LINTING

interface FormiProps {
  calories: number;
  targetCalories: number;
  workoutDone: boolean;
  protein: number;
  targetProtein?: number;
}

export const FormiAvatar = ({ calories, targetCalories, workoutDone, protein, targetProtein }: FormiProps) => {
  // LÓGICA DE ESTADOS DE FORMI
  let state = 'feliz'; // estado por defecto
  let message = '¡Todo va genial!';

  const caloriePercent = (calories / targetCalories) * 100;

  if (workoutDone) {
    state = 'celebrando';
    message = '¡Entrenamiento completado! 🌟';
  } else if (caloriePercent < 20) {
    state = 'hambre';
    message = 'Tengo hambre... ¿comemos algo? 🍎';
  } else if (caloriePercent > 110) {
    state = 'saciado';
    message = '¡Uff, estoy llenísimo! 🍰';
  } else if (protein < (targetProtein || 100) * 0.5) {
    state = 'motivado'; // Formi pidiendo proteína
    message = '¡Necesitamos más proteína para los músculos! 💪';
  }

  return (
    <div className="formi-container">
      <div className="formi-bubble">
        <p>{message}</p>
      </div>
      <img 
        src={`/assets/formi/${state}.png`} 
        alt="Formi Mascot" 
        className="formi-image" 
      />
    </div>
  );
};
