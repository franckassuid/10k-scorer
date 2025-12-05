import React from 'react';
import { clsx } from 'clsx';
import { Plus, Minus, Check, Ban, RotateCcw } from 'lucide-react';

export function Controls({ tempScore, onUpdate, onValidate, onBar, onUndo, canValidate }) {
    const values = [100, 200, 500];

    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4">

            {/* Temp Score Display */}
            <div className="flex items-center justify-center mb-4">
                <div className={clsx(
                    "text-6xl font-light tracking-tighter transition-colors duration-300",
                    tempScore > 0 ? "text-white" : "text-white/20"
                )}>
                    {tempScore > 0 ? tempScore : "0"}
                </div>
            </div>

            {/* Score Modifiers */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                {values.map((val) => (
                    <button
                        key={`add-${val}`}
                        onClick={() => onUpdate(val)}
                        className="h-10 md:h-14 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 group"
                    >
                        <span className="text-base md:text-xl font-light text-white group-hover:text-emerald-400 transition-colors">+{val}</span>
                    </button>
                ))}
                {values.map((val) => (
                    <button
                        key={`sub-${val}`}
                        onClick={() => onUpdate(-val)}
                        className="h-8 md:h-12 rounded-md md:rounded-lg bg-transparent border border-white/5 hover:border-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 group"
                    >
                        <span className="text-xs md:text-sm font-light text-white/40 group-hover:text-red-400 transition-colors">-{val}</span>
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 mt-2 md:mt-3">
                <button
                    onClick={onBar}
                    className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
                >
                    <Ban size={16} className="md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-xs font-medium tracking-widest uppercase">Barre</span>
                </button>

                <button
                    onClick={onUndo}
                    className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
                >
                    <RotateCcw size={16} className="md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-xs font-medium tracking-widest uppercase">Annuler</span>
                </button>

                <button
                    onClick={onValidate}
                    disabled={!canValidate}
                    className={clsx(
                        "h-12 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95",
                        canValidate
                            ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            : "bg-white/5 text-white/20 cursor-not-allowed opacity-50"
                    )}
                >
                    <Check size={20} className="md:w-6 md:h-6" />
                    <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Valider</span>
                </button>
            </div>

            {/* Bar Button (Moved below or separate?) 
                Wait, I replaced the Bar button with Undo. 
                The user wants "cancel last entry". 
                I should keep Bar button too? 
                "Tu peux ajouter un bouton pour annuler la dernière entrée"
                I should probably keep Bar button and add Undo.
                Let's make a grid of 3? Or put Undo somewhere else?
                The Bar button is important for the game (failing a turn).
                Let's put Undo in a separate row or make the grid 3 columns?
                Or put Undo next to Bar?
                Let's try grid-cols-3 for the bottom row: Bar, Undo, Validate.
            */}
        </div>
    );
}
