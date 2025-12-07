import { useEffect } from 'react';
import { useGame } from './hooks/useGame';
import DebugModal from './components/DebugModal';
import HUD from './components/HUD';
import { BrewingVisuals, BrewingControls } from './components/BrewingStation';
import ShopModal from './components/ShopModal';
import InventoryModal from './components/InventoryModal';
import SettingsModal from './components/SettingsModal';

import WikiModal from './components/WikiModal';

import IntroModal from './components/IntroModal';
import GameLog from './components/GameLog';
import ModeSelectionModal from './components/ModeSelectionModal';
import DaySummaryModal from './components/DaySummaryModal';
import DialogueOverlay from './components/DialogueOverlay';

import CharacterArea from './components/CharacterArea';

function App() {
  const game = useGame();
  const { uiState, toggleModal, startGame } = game;
  // Expose game to window for debugging
  useEffect(() => {
    window.game = game;
  }, [game]);

  // Handle Dark Mode
  useEffect(() => {
    if (game.gameState.darkModeEnabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [game.gameState.darkModeEnabled]);

  return (
    <div className="game-container">
      <img src="/assets/pixel_cafe_bg.png" className="bg-image" alt="Coffee Shop Background" />
      <HUD {...game} />
      <div className="work-space">
        <CharacterArea
          currentCustomer={game.gameState.currentCustomer}
          minutesElapsed={game.gameState.minutesElapsed}
        />
        <BrewingVisuals {...game} />
      </div>
      <BrewingControls {...game} toggleModal={toggleModal} />

      <GameLog logs={game.gameState.logs} />

      <DialogueOverlay
        dialogueState={game.dialogue.state}
        onNext={game.dialogue.next}
        onChoice={game.dialogue.choice}
      />

      {/* Modals */}
      <IntroModal
        isOpen={uiState.activeModal === 'intro'}
        onStart={startGame}
      />
      <ShopModal
        isOpen={uiState.activeModal === 'shop'}
        onClose={() => toggleModal('shop')}
        {...game}
      />
      <InventoryModal
        isOpen={uiState.activeModal === 'inventory'}
        onClose={() => toggleModal('inventory')}
        {...game}
      />
      <SettingsModal
        isOpen={uiState.activeModal === 'settings'}
        onClose={() => toggleModal('settings')}
        actions={{
          ...game,
          openWiki: () => toggleModal('wiki')
        }}
        gameState={game.gameState}
      />

      <WikiModal
        isOpen={uiState.activeModal === 'wiki'}
        onClose={() => toggleModal('wiki')}
      />


      <DebugModal
        isOpen={uiState.showDebug}
        onClose={() => toggleModal('debug')} // Assuming toggleModal can handle 'debug' or toggleDebugMenu is used
        {...game}
      />

      {/* Music Controls */}
      <button className="music-toggle" onClick={() => game.toggleMusic(!game.gameState.settings.musicEnabled)} title="Toggle Music">
        {game.gameState.settings.musicEnabled ? '🔊' : '🔇'}
      </button>
      <button className="skip-toggle" onClick={game.skipTrack} title="Skip Track">
        ⏭️
      </button>
      <button className="settings-toggle" onClick={() => toggleModal('settings')} title="Settings">
        ⚙️
      </button>
    </div>
  );
}

export default App;
