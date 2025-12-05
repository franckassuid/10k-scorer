import { useState, useEffect } from 'react';

const STORAGE_KEY = '10k-scorer-state';

const INITIAL_STATE = {
    players: [
        { id: 1, name: 'Joueur 1', score: 0, history: [] },
        { id: 2, name: 'Joueur 2', score: 0, history: [] },
    ],
    currentPlayerIndex: 0,
    history: [], // Global undo history
    notification: null,
};

// Helper to get the current valid score from history
const getCurrentScore = (history) => {
    // Find the last history entry that is NOT crossed
    const validEntries = history.filter(h => !h.crossed);
    if (validEntries.length === 0) return 0;
    return validEntries[validEntries.length - 1].totalScore;
};

export const useGameLogic = () => {
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration: Ensure all players have history array and totalScore
            parsed.players = parsed.players.map(p => {
                const history = p.history || [];
                // Recalculate totalScore for legacy entries
                let runningTotal = 0;
                const migratedHistory = history.map(h => {
                    if (h.totalScore !== undefined) {
                        runningTotal = h.totalScore;
                        return h;
                    }
                    // Legacy entry: assume value is the delta
                    // If it's a reset/cut, value might be negative or 0?
                    // Legacy 'score' type has value.
                    // Legacy 'cut' type? We didn't have cuts in history before, we just modified score.
                    // Actually, we did add 'cut' type in previous steps.
                    // But if it's VERY old legacy, it might just be scores.
                    // Let's assume value is additive.
                    runningTotal += (h.value || 0);
                    return { ...h, totalScore: runningTotal };
                });

                return {
                    ...p,
                    history: migratedHistory,
                    score: migratedHistory.length > 0 ? getCurrentScore(migratedHistory) : 0
                };
            });
            return parsed;
        }
        return INITIAL_STATE;
    });

    const [tempScore, setTempScore] = useState(0);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const pushHistory = () => {
        setState(prev => ({
            ...prev,
            history: [...prev.history, {
                players: JSON.parse(JSON.stringify(prev.players)),
                currentPlayerIndex: prev.currentPlayerIndex
            }].slice(-50)
        }));
    };

    const undo = () => {
        setState(prev => {
            if (prev.history.length === 0) return prev;
            const lastState = prev.history[prev.history.length - 1];
            return {
                ...prev,
                players: lastState.players,
                currentPlayerIndex: lastState.currentPlayerIndex,
                history: prev.history.slice(0, -1),
                notification: { message: 'Action annulée', type: 'info' }
            };
        });
        setTempScore(0);
    };



    const addPlayer = (name) => {
        pushHistory();
        setState(prev => ({
            ...prev,
            players: [...prev.players, {
                id: Date.now(),
                name: name || `Joueur ${prev.players.length + 1}`,
                score: 0,
                history: []
            }]
        }));
    };

    const removePlayer = (id) => {
        pushHistory();
        setState(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== id)
        }));
    };

    const updatePlayerName = (id, name) => {
        setState(prev => ({
            ...prev,
            players: prev.players.map(p => p.id === id ? { ...p, name } : p)
        }));
    };

    const resetGame = () => {
        pushHistory();
        setState(prev => ({
            ...INITIAL_STATE,
            players: prev.players.map(p => ({
                ...p,
                score: 0,
                history: []
            })),
            history: [],
            notification: { message: 'Nouvelle partie commencée', type: 'success' }
        }));
        setTempScore(0);
    };

    const updateTempScore = (amount) => {
        setTempScore(prev => {
            const newScore = prev + amount;
            // Allow negative temp score for corrections? User said "Le score du tour est >= 200 (ou <= -200)".
            // But usually you add points. Let's assume standard addition for now.
            // If user wants to remove points manually, they might need a different mechanism or just negative buttons.
            // The buttons are +/-. So yes.
            return newScore;
        });
    };

    const validateTurn = () => {
        const currentPlayer = state.players[state.currentPlayerIndex];

        // Validation rules
        if (tempScore !== 0) {
            if (Math.abs(tempScore) < 200) {
                setState(prev => ({ ...prev, notification: { message: 'Minimum 200 points requis !', type: 'error' } }));
                return;
            }
            if (tempScore % 100 !== 0) {
                setState(prev => ({ ...prev, notification: { message: 'Le score doit être un multiple de 100 !', type: 'error' } }));
                return;
            }
        }

        pushHistory();

        let notification = null;
        let newPlayers = [...state.players];
        let player = { ...newPlayers[state.currentPlayerIndex] };

        const currentScore = getCurrentScore(player.history);
        const newTotalScore = currentScore + tempScore;

        // Cross Logic: Check if newTotalScore matches any opponent's valid total score
        if (tempScore !== 0) { // Only check cross if score changed? Or always? Usually on score change.
            newPlayers.forEach((p, idx) => {
                if (idx !== state.currentPlayerIndex) {
                    // Find if opponent has this total score in their history AND it is not crossed
                    const matchingEntryIndex = p.history.findIndex(h => h.totalScore === newTotalScore && !h.crossed);

                    if (matchingEntryIndex !== -1) {
                        // Cross it out!
                        const newOpponentHistory = [...p.history];
                        newOpponentHistory[matchingEntryIndex] = {
                            ...newOpponentHistory[matchingEntryIndex],
                            crossed: true,
                            crossReason: 'cut' // To distinguish from bars if needed
                        };

                        newPlayers[idx] = {
                            ...p,
                            history: newOpponentHistory,
                            score: getCurrentScore(newOpponentHistory)
                        };
                        notification = { message: `(${player.name} barre ${p.name} à ${newTotalScore})`, type: 'warning' };
                    }
                }
            });
        }

        // Add new entry for current player
        // If tempScore is 0, it's a pass. Does it add a history entry?
        // "Si un joueur choisit un tour à 0 point, il prend 1 barre." -> This is handled by "Bar" button usually.
        // But if they validate 0?
        // Let's assume Validate 0 is just a pass without penalty if they didn't click Bar?
        // User said: "Si un joueur choisit un tour à 0 point, il prend 1 barre."
        // So Validate 0 SHOULD be a Bar?
        // But we have a separate "Bar" button.
        // Let's keep Validate for points and Bar button for bars.
        // If they validate 0, maybe they just want to pass turn?
        // But in 10000, if you don't score, you get a bar.
        // So Validate 0 should probably trigger addBar logic?
        // Let's stick to: Validate is for Points. Bar button is for 0 points/fail.

        if (tempScore !== 0) {
            const newEntry = {
                totalScore: newTotalScore,
                turnScore: tempScore,
                type: 'score',
                bars: 0,
                crossed: false,
                turn: state.history.length + 1
            };

            player.history = [...player.history, newEntry];
            player.score = getCurrentScore(player.history);
        }

        newPlayers[state.currentPlayerIndex] = player;

        // Win Condition Check
        let winner = null;
        if (newTotalScore >= 10000) {
            winner = player;
            // Trigger confetti
            import('canvas-confetti').then((confetti) => {
                confetti.default({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });
        }

        setState(prev => ({
            ...prev,
            players: newPlayers,
            currentPlayerIndex: winner ? prev.currentPlayerIndex : (prev.currentPlayerIndex + 1) % prev.players.length, // Don't change turn if won
            notification: notification || prev.notification,
            winner: winner // Add winner to state
        }));
        setTempScore(0);
    };

    const addBar = () => {
        pushHistory();
        let newPlayers = [...state.players];
        let player = { ...newPlayers[state.currentPlayerIndex] };
        let notification = null;

        // Find the last uncrossed history entry
        // We attach the bar to the current standing (last valid entry)
        // If no history, we can't attach a bar? Or do we attach to a "0" state?
        // If 0 bars at 0 points, it's fine.
        // If we have history, we attach to the last one.

        const validEntries = player.history.filter(h => !h.crossed);

        if (validEntries.length > 0) {
            const lastValidIndex = player.history.indexOf(validEntries[validEntries.length - 1]);
            const targetEntry = { ...player.history[lastValidIndex] };

            targetEntry.bars += 1;

            if (targetEntry.bars >= 3) {
                targetEntry.crossed = true;
                targetEntry.crossReason = 'bars';
                notification = { message: `${player.name} : 3 barres ! Score ${targetEntry.totalScore} annulé.`, type: 'error' };
            } else {
                notification = { message: `${player.name} : Barre ${targetEntry.bars}/3`, type: 'info' };
            }

            const newHistory = [...player.history];
            newHistory[lastValidIndex] = targetEntry;
            player.history = newHistory;
            player.score = getCurrentScore(player.history); // Recalculate in case it was crossed
        } else {
            // No valid history. Player is at 0.
            // Do we track bars at 0?
            // "Si un joueur choisit un tour à 0 point, il prend 1 barre."
            // Maybe we need a dummy entry for 0 if it doesn't exist?
            // Or just notify and do nothing effectively on score?
            // Let's add a "0" entry if history is empty so we can track bars on it.
            const newEntry = {
                totalScore: 0,
                turnScore: 0,
                type: 'start',
                bars: 1,
                crossed: false,
                turn: state.history.length + 1
            };
            player.history = [...player.history, newEntry];
            notification = { message: `${player.name} : Barre 1/3 (Départ)`, type: 'info' };
        }

        newPlayers[state.currentPlayerIndex] = player;

        setState(prev => ({
            ...prev,
            players: newPlayers,
            currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
            notification
        }));
        setTempScore(0);
    };

    const clearNotification = () => setState(prev => ({ ...prev, notification: null }));

    const continueGame = () => {
        setState(prev => ({
            ...prev,
            winner: null,
            currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
        }));
    };

    return {
        state,
        tempScore,
        actions: {
            addPlayer,
            removePlayer,
            updatePlayerName,
            resetGame,
            updateTempScore,
            validateTurn,
            addBar,
            undo,
            clearNotification,
            continueGame,
            setCurrentPlayer: (index) => setState(prev => ({ ...prev, currentPlayerIndex: index }))
        }
    };
};
