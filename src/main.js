// src/main.js
import { Customer } from './utils/customer.js';
import { checkCustomerPatience } from './game/patience.js';

class Game {
  constructor() {
    this.state = {
      currentCustomer: null,
      decorations: [],     // e.g., ['plant', 'plant']
      ui: {
        customerPortrait: document.getElementById('portrait'),
        updateHUD: () => {/* render patience bar, etc. */}
      }
    };

    this.log = console.log;
    this.state.minutesPassed = 0; // example time counter
    // Example: create a new customer
    this.state.currentCustomer = new Customer('Alice', 100, 1.5);
  }

  // Example game loop tick
  tick(minutesPassed) {
    this.state.minutesPassed = minutesPassed;
    checkCustomerPatience(this.state, this.log);
  }
}

window.onload = () => new Game();