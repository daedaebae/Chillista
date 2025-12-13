import { useEffect, useState } from 'react';
import Tooltip from './components/Tooltip';
import { useGame } from './hooks/useGame';
import DebugModal from './components/DebugModal';
import HUD from './components/HUD';
import { BrewingVisuals, BrewingControls } from './components/BrewingStation';
import ShopModal from './components/ShopModal';
import InventoryModal from './components/InventoryModal';
import SettingsModal from './components/SettingsModal';

import WikiModal from './components/WikiModal';
import FinancialsModal from './components/FinancialsModal';
import ReputationModal from './components/ReputationModal';
import CustomersModal from './components/CustomersModal';
import CalendarModal from './components/CalendarModal';
import AvatarModal from './components/AvatarModal';

import IntroModal from './components/IntroModal';
import GameLog from './components/GameLog';
import ModeSelectionModal from './components/ModeSelectionModal';
import DaySummaryModal from './components/DaySummaryModal';
import DialogueOverlay from './components/DialogueOverlay';

import CharacterArea from './components/CharacterArea';
import CartDesigner from './components/CartDesigner/CartDesigner';

import pixelCafeBg from './assets/backgrounds/pixel_cafe_bg.png';

function App() {
  const game = useGame();
  const { uiState, toggleModal, startGame } = game;
  const [gameStage, setGameStage] = useState('main'); // Default to main
  const [tempPlayerName, setTempPlayerName] = useState('Barista');

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

  // Handle Debug Toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '`' || e.key === '~') {
        game.toggleDebugMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game]);

  const handleIntroComplete = (name) => {
    setTempPlayerName(name);
    setGameStage('designer');
  };

  const handleDesignerComplete = (designData) => {
    console.log("Cart Design Complete:", designData);
    // Start the main game with the name collected earlier
    // FUTURE: Pass designData stats to startGame to affect gameplay
    startGame(tempPlayerName);
    setGameStage('main');
  };

  if (gameStage === 'designer') {
    return <CartDesigner onGameStart={handleDesignerComplete} />;
  }

  return (
    <div className="game-container">
      <img src={pixelCafeBg} className="bg-image" alt="Coffee Shop Background" />
      <HUD {...game} />


      <div className="work-space">
        {/* Layer 1: Avatars (Behind Station) */}
        <CharacterArea
          currentCustomer={game.gameState.currentCustomer}
          minutesElapsed={game.gameState.minutesElapsed}
          playerName={game.gameState.playerName}
          playerAvatar={game.gameState.playerAvatar}
          onEditProfile={() => toggleModal('avatar')}
          renderMode="avatars"
        />

        {/* The Station */}
        <BrewingVisuals {...game} />

        {/* Layer 2: Bubbles (Above Station) */}
        <CharacterArea
          currentCustomer={game.gameState.currentCustomer}
          minutesElapsed={game.gameState.minutesElapsed}
          playerName={game.gameState.playerName}
          playerAvatar={game.gameState.playerAvatar}
          onEditProfile={() => toggleModal('avatar')}
          renderMode="bubbles"
        />
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
        onStart={handleIntroComplete}
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

      {uiState.activeModal === 'financials' && (
        <FinancialsModal
          gameState={game.gameState}
          close={() => toggleModal('financials')}
        />
      )}

      {uiState.activeModal === 'reputation' && (
        <ReputationModal
          gameState={game.gameState}
          close={() => toggleModal('reputation')}
        />
      )}

      {uiState.activeModal === 'customers' && (
        <CustomersModal
          gameState={game.gameState}
          close={() => toggleModal('customers')}
        />
      )}

      {uiState.activeModal === 'calendar' && (
        <CalendarModal
          gameState={game.gameState}
          close={() => toggleModal('calendar')}
        />
      )}

      {uiState.activeModal === 'wiki' && (
        <WikiModal close={() => toggleModal('wiki')} />
      )}

      {uiState.activeModal === 'avatar' && (
        <AvatarModal
          gameState={game.gameState}
          setPlayerAvatar={game.setPlayerAvatar}
          setPlayerName={game.setPlayerName}
          close={() => toggleModal('avatar')}
        />
      )}

      <DebugModal
        isOpen={uiState.showDebug}
        onClose={game.toggleDebugMenu}
        {...game}
      />

      <ModeSelectionModal
        isOpen={uiState.activeModal === 'mode'}
        onClose={() => toggleModal('mode')}
        onSelectMode={game.selectMode}
        unlockedModes={game.gameState.upgrades}
      />

      {/* Floating Controls */}
      <div className="floating-controls">
        <Tooltip text={game.gameState.settings.musicEnabled ? "Mute Music" : "Play Music"} placement="left">
          <button className="music-toggle" onClick={() => game.toggleMusic(!game.gameState.settings.musicEnabled)}>
            {game.gameState.settings.musicEnabled ? '🔊' : '🔇'}
          </button>
        </Tooltip>

        <Tooltip text="Skip Song" placement="left">
          <button className="skip-toggle" onClick={game.skipTrack}>
            ⏭️
          </button>
        </Tooltip>

        <Tooltip text="Game Options" placement="left">
          <button className="settings-toggle" onClick={() => toggleModal('settings')}>
            ⚙️
          </button>
        </Tooltip>

        <Tooltip text="Barista Guide" placement="left">
          <button className="wiki-toggle" onClick={() => toggleModal('wiki')}>
            📚
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default App;
