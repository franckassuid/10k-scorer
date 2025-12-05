import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { ScoreColumn } from './components/ScoreColumn';
import { Controls } from './components/Controls';
import { Menu, RotateCcw, MoreVertical, X, UserPlus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

function App() {
  const { state, tempScore, actions } = useGameLogic();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);

  const canValidate = (tempScore === 0) || (tempScore >= 200 && tempScore % 100 === 0);

  return (
    <div className="h-screen bg-black text-white flex flex-col font-sans selection:bg-white/20 overflow-hidden">

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="10K Scorer Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            10K Scorer
          </h1>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 text-white/50 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Main Content Area - Horizontal Scroll for Columns on Mobile, Centered Grid on Desktop */}
      <main className="flex-1 flex md:flex-wrap justify-start md:justify-center overflow-x-auto md:overflow-x-hidden overflow-y-hidden snap-x snap-mandatory md:snap-none md:gap-4 md:p-8 px-4 md:px-0">
        {state.players.map((player, index) => (
          <div key={player.id} className="snap-center h-full md:h-[calc(100vh-200px)] md:w-auto flex-shrink-0">
            <ScoreColumn
              player={player}
              isActive={index === state.currentPlayerIndex}
              onEdit={() => setEditingPlayerId(player.id)}
              onSelect={() => actions.setCurrentPlayer(index)}
            />
          </div>
        ))}

        {/* Add Player Column */}
        <div className="min-w-[100px] md:min-w-[80px] flex items-center justify-center border-l border-white/5 md:border-l-0 snap-center">
          <button
            onClick={() => actions.addPlayer()}
            className="p-4 rounded-full border border-dashed border-white/10 text-white/20 hover:text-white hover:border-white/30 transition-all group"
          >
            <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </main>

      {/* Controls Area - Sticky Bottom */}
      <div className="bg-black border-t border-white/10 pb-8 pt-4 shrink-0 z-40">
        <div className="max-w-screen-md mx-auto w-full">
          <Controls
            tempScore={tempScore}
            onUpdate={actions.updateTempScore}
            onValidate={actions.validateTurn}
            onBar={actions.addBar}
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
