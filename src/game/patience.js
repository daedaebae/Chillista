// src/game/patience.js
import { hidePortrait } from '../ui/portrait.js';
import { getDecayModifier } from './decay.js';

export function checkCustomerPatience(state, log) {
  if (!state.currentCustomer) return;

  const minutes = Math.max(0, state.minutesPassed);
  const decayModifier = getDecayModifier(state.decorations);

  state.currentCustomer.decayPatience(minutes, decayModifier);

  if (state.currentCustomer.hasLeft()) {
    log(`${state.currentCustomer.name} left quietly.`, 'error');
    state.currentCustomer = null;
    hidePortrait(state.ui.customerPortrait);
    // TODO: apply any penalty logic here
  }

  // Update the HUD so the player sees the new patience value
  state.ui.updateHUD();
}