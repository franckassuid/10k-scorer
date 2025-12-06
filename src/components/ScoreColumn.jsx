import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export function ScoreColumn({ player, isActive, onEdit, onSelect }) {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom when history changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [player.history]);

    return (
        <div className={clsx(
            "flex flex-col h-full w-full border-r border-white/10 last:border-r-0 md:border-r-0 md:rounded-2xl transition-all duration-300 overflow-hidden",
            isActive ? "bg-white/5 md:bg-white/10 md:scale-105 md:shadow-2xl md:z-10" : "bg-transparent md:bg-white/5"
        )}>
            {/* Header - Fixed */}
            <div className="p-2 md:p-6 flex flex-col items-center border-b border-white/10 bg-black/90 backdrop-blur-sm z-20 shrink-0">
                <button
                    onClick={onEdit}
                    className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors mb-1 md:mb-4 truncate max-w-full"
                >
                    {player.name}
                </button>

                {/* Total Score */}
                <div className={clsx(
                    "text-3xl md:text-5xl font-light tracking-tighter tabular-nums transition-colors mb-1 md:mb-4",
                    isActive ? "text-white" : "text-white/50"
                )}>
                    {player.score.toLocaleString()}
                </div>

                {/* Manual Selection Button */}
                {!isActive && (
                    <button
                        onClick={onSelect}
                        className="px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10 text-[9px] md:text-xs text-white/30 hover:text-white hover:border-white/30 transition-all uppercase tracking-widest"
                    >
                        Select
                    </button>
                )}
                {isActive && (
                    <div className="h-[20px] md:h-[26px]" /> /* Spacer to keep alignment */
                )}
            </div>

            {/* History List (Total Scores) - Scrollable */}
            <div className="flex-1 overflow-y-auto p-1 md:p-2 space-y-0.5 md:space-y-1 scrollbar-hide scroll-smooth w-full">
                {(player.history || []).map((entry, idx) => (
                    <div
                        key={`${entry.turn}-${idx}`}
                        className={clsx(
                            "flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 rounded text-sm md:text-lg font-medium tabular-nums transition-all",
                            entry.crossed ? "opacity-30 line-through decoration-2 decoration-red-500" : "opacity-100",
                            "text-white"
                        )}
                    >
                        {/* Total Score Display */}
                        <div className="flex items-center gap-1 md:gap-2">
                            {entry.type === 'start' && <span className="text-[9px] md:text-[10px] text-white/30">Start</span>}

                            <span>
                                {(entry.totalScore || 0).toLocaleString()}
                            </span>
                        </div>

                        {/* Status Icons (Bars / Cut) */}
                        <div className="flex items-center gap-1 md:gap-2">
                            {/* Bars as Vertical Lines */}
                            {entry.bars > 0 && (
                                <div className="flex gap-0.5 md:gap-1">
                                    {[...Array(entry.bars)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-0.5 md:w-1 h-2.5 md:h-4 rounded-sm bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {/* Dummy div for auto-scroll */}
                <div ref={scrollRef} />
            </div>
        </div>
    );
}
