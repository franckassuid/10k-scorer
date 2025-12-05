import React from 'react';
import { clsx } from 'clsx';
import { Check, Ban } from 'lucide-react';

export function Controls({ tempScore, onUpdate, onValidate, onBar, canValidate }) {
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
            <div className="grid grid-cols-3 gap-2">
                {values.map((val) => (
                    <button
                        key={`add-${val}`}
                        onClick={() => onUpdate(val)}
                        className="h-14 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                        <span className="text-xl font-light text-white group-hover:text-emerald-400 transition-colors">+{val}</span>
                    </button>
                ))}
                {values.map((val) => (
                    <button
                        key={`sub-${val}`}
                        onClick={() => onUpdate(-val)}
                        className="h-12 rounded-lg bg-transparent border border-white/5 hover:border-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                        <span className="text-sm font-light text-white/40 group-hover:text-red-400 transition-colors">-{val}</span>
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                    onClick={onBar}
                    className="h-16 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                >
                    <Ban size={20} />
                    <span className="text-xs font-medium tracking-widest uppercase">Barre</span>
                </button>

                <button
                    onClick={onValidate}
                    disabled={!canValidate}
                    className={clsx(
                        "h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                        canValidate
                            ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            : "bg-white/5 text-white/20 cursor-not-allowed opacity-50"
                    )}
                >
                    <Check size={24} />
                    <span className="text-xs font-bold tracking-widest uppercase">Valider</span>
                </button>
            </div>
        </div>
    );
}
