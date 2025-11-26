// src/game/decay.js
// Return a modifier based on the current decorations
export function getDecayModifier(decorations) {
  const plantCount = decorations.filter(d => d === 'plant').length;
  return Math.pow(0.8, plantCount); // 20% slower per plant
}