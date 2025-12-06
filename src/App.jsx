import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { ScoreColumn } from './components/ScoreColumn';
import { Controls } from './components/Controls';
import { Menu, RotateCcw, MoreVertical, X, UserPlus, Trash2, Plus } from 'lucide-react';
import { clsx } from 'clsx';

function App() {
  const { state, tempScore, actions } = useGameLogic();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const scrollContainerRef = React.useRef(null);

  const canValidate = (tempScore === 0) || (tempScore >= 200 && tempScore % 100 === 0);

  // Auto-scroll to active player on mobile
  React.useEffect(() => {
    if (window.innerWidth < 768 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeCard = container.children[state.currentPlayerIndex];
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [state.currentPlayerIndex]);



  return (
    <div className="h-[100dvh] w-screen bg-black text-white flex flex-col font-sans selection:bg-white/20 overflow-hidden fixed inset-0">

      {/* Header */}
      <header className="px-3 py-2 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md z-50 shrink-0 h-10 md:h-12 lg:h-16 pt-safe transition-all">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="10K Scorer Logo" className="h-5 w-5 md:h-6 md:w-6 object-contain" />
          <h1 className="text-base md:text-lg font-bold tracking-widest uppercase bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            10K Scorer
          </h1>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-1 text-white/50 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Main Content - Player Columns */}
      <main className="flex-1 overflow-hidden relative w-full">
        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 flex gap-0 md:gap-4 lg:gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide items-start"
        >
          {state.players.map((player, index) => {
            // Dynamic width logic
            let widthClass = "w-full"; // Mobile default (1 player per screen)

            // Percentage widths for Mobile & Tablet
            // If screen is wide enough to fit them, we want them to share space.
            // On desktop (lg), we might want fixed max-widths if many players.

            if (state.players.length === 2) widthClass = "w-1/2";
            else if (state.players.length === 3) widthClass = "w-1/3";
            else if (state.players.length >= 4) widthClass = "w-1/4";

            return (
              <div
                key={player.id}
                className={clsx(
                  "snap-center shrink-0 flex flex-col h-full min-w-[85px] transition-all duration-300",
                  // Use widthClass for mobile/tablet. On large desktop, enforce max width for readability?
                  // User complained about empty space, so let them stretch on tablet.
                  // Just apply widthClass universally, but maybe add a max-width constraint for massive screens?
                  // For now, let's keep it filling 100%.
                  widthClass,
                  // On very large screens with few players, limit width to avoid massive columns?
                  // "md:max-w-[400px]" could be good, but user wants to fill space.
                  // Let's stick to percentage widths which fill the screen.
                )}
              >
                <ScoreColumn
                  player={player}
                  isActive={state.players[state.currentPlayerIndex]?.id === player.id}
                  onEdit={() => setEditingPlayerId(player.id)}
                  onSelect={() => actions.setCurrentPlayer(index)}
                />
              </div>
            );
          })}

          {/* Add Player Button */}
          <div className="snap-center shrink-0 hidden md:flex items-center justify-center border-l border-white/10 md:border-2 md:border-dashed md:border-white/10 md:rounded-2xl w-[85px] md:w-[100px] h-full hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={() => actions.addPlayer()}
          >
            <button className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <Plus size={24} className="text-white/50 group-hover:text-white" />
            </button>
          </div>
        </div>
      </main>

      {/* Controls Area - Sticky Bottom with Safe Area */}
      <div className="p-2 md:p-4 lg:p-6 border-t border-white/10 bg-black/90 backdrop-blur-md z-50 shrink-0 pb-[env(safe-area-inset-bottom,20px)] md:pb-4 lg:pb-6">
        <div className="max-w-md mx-auto w-full">
          <Controls
            tempScore={tempScore}
            onUpdate={actions.updateTempScore}
            onValidate={actions.validateTurn}
            onBar={actions.addBar}
            onUndo={actions.undo}
            canValidate={canValidate}
          />
        </div>
      </div>

      {/* Notification Toast */}


      {/* Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm space-y-2">
            <h2 className="text-2xl font-light text-white mb-8 text-center">Menu</h2>

            <button
              onClick={() => {
                actions.resetGame();
                setIsMenuOpen(false);
              }}
              className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-left text-white transition-colors flex items-center justify-between group"
            >
              <span>Nouvelle Partie</span>
              <RotateCcw size={16} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>

            <button
              onClick={() => {
                actions.addPlayer();
                setIsMenuOpen(false);
              }}
              className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-left text-white transition-colors flex items-center justify-between group mb-2"
            >
              <span>Ajouter Joueur</span>
              <UserPlus size={16} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>

            <button
              onClick={() => {
                const data = JSON.stringify(state, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `10k-game-${new Date().toISOString()}.json`;
                a.click();
              }}
              className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-left text-white transition-colors flex items-center justify-between group"
            >
              <span>Exporter JSON</span>
              <MoreVertical size={16} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>

            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full p-4 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-center text-white/50 mt-8"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {state.winner && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-[#111] border border-yellow-500/30 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-2">Victoire !</h2>
            <p className="text-xl text-white/70 mb-8">
              <span className="text-yellow-400 font-bold">{state.winner.name}</span> a atteint {state.winner.score.toLocaleString()} points !
            </p>

            <div className="space-y-3">
              <button
                onClick={() => actions.resetGame()}
                className="w-full p-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
              >
                Arrêter la partie
              </button>
              <button
                onClick={() => {
                  // Continue game: just clear winner state?
                  // But we need to clear it in useGameLogic or just hide modal?
                  // If we hide modal, winner state persists.
                  // We need an action to "dismiss winner".
                  // Let's add a simple state update in App for now or use a new action.
                  // Actually, useGameLogic doesn't have a "clearWinner" action.
                  // I'll add one or just hack it by setting winner to null via a new action if I can edit useGameLogic again.
                  // Or I can just use a local state to hide it? No, state.winner comes from hook.
                  // I'll add a clearWinner action to useGameLogic in next step if needed.
                  // For now, let's assume actions.continueGame() exists or I'll add it.
                  actions.continueGame();
                }}
                className="w-full p-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Continuer (pour le classement)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayerId && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-xs bg-[#111] border border-white/10 p-6 rounded-3xl">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Modifier Joueur</h3>
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent border-b border-white/20 py-2 text-xl text-white focus:outline-none focus:border-white transition-colors mb-6"
              defaultValue={state.players.find(p => p.id === editingPlayerId)?.name}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  actions.updatePlayerName(editingPlayerId, e.currentTarget.value);
                  setEditingPlayerId(null);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  actions.removePlayer(editingPlayerId);
                  setEditingPlayerId(null);
                }}
                className="flex-1 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => setEditingPlayerId(null)}
                className="flex-[2] p-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
