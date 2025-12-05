import React from 'react';
import { clsx } from 'clsx';

export function PlayerCard({ player, isActive, onEdit }) {
    return (
        <div
            className={clsx(
                "relative flex flex-col items-center justify-center py-8 px-4 transition-all duration-500 ease-out",
                isActive ? "opacity-100 scale-105" : "opacity-30 scale-95 blur-[1px]"
            )}
        >
            {/* Bars Indicator - Minimalist Lines */}
            <div className="absolute top-4 right-4 flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className={clsx(
                            "w-1 h-6 rounded-full transition-all duration-300",
                            i < player.bars ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-white/10"
                        )}
                    />
                ))}
            </div>

            <button
                onClick={onEdit}
                className="text-xs font-medium tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors mb-2"
            >
                {player.name}
            </button>

            <div className="text-7xl font-light tracking-tighter text-white tabular-nums">
                {player.score.toLocaleString()}
            </div>

            <div className={clsx(
                "h-6 mt-2 text-sm font-medium tracking-wide transition-all duration-300",
                player.lastTurnScore > 0 && isActive ? "text-emerald-400 opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
                +{player.lastTurnScore}
            </div>
        </div>
    );
}
