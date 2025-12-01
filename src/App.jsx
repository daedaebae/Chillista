import { useState } from 'react'
import DebugGame from './components/DebugGame';
import HUD from './components/HUD';

function App() {
  return (
    <div className="game-container">
      <HUD />
      <DebugGame />
    </div>
  );
}

export default App;
