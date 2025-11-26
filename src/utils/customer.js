// src/utils/customer.js
export class Customer {
  constructor(name, patience, decay) {
    this.name = name;
    this.patience = patience; // current patience
    this.decay = decay;       // patience decay per minute
  }

  // Reduce patience based on elapsed time and optional modifiers
  decayPatience(minutesPassed, decayModifier = 1.0) {
    const decay = this.decay * minutesPassed * decayModifier;
    this.patience = Math.max(0, this.patience - decay);
  }

  hasLeft() {
    return this.patience <= 0;
  }
}