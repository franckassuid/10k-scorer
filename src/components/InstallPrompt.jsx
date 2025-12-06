import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';
import { clsx } from 'clsx';

export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        // Check if user has already dismissed or installed
        const hasInteracted = localStorage.getItem('pwa_prompt_interacted');
        if (hasInteracted) return;

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        // Detect if already in standalone mode (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) return;

        // Handle Android/Desktop installation prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show prompt immediately (as we can't detect "can install" event, only check if not standalone)
        if (isIOSDevice) {
            // Delay slightly for better UX
            setTimeout(() => setShowPrompt(true), 2000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
                localStorage.setItem('pwa_prompt_interacted', 'true');
            }
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_interacted', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-x-4 bottom-24 md:bottom-32 z-[80] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 max-w-md mx-auto relative backdrop-blur-xl">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-white/30 hover:text-white transition-colors p-2"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="App Icon" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">Installer l'application</h3>
                        <p className="text-xs text-white/50 mt-0.5">Pour une meilleure expérience plein écran, installez l'application.</p>
                    </div>
                </div>

                {isIOS ? (
                    <div className="bg-white/5 rounded-xl p-3 text-xs text-white/70 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full text-white">1</span>
                            <span>Appuyez sur le bouton de partage <Share size={12} className="inline ml-1" /></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full text-white">2</span>
                            <span>Sélectionnez "Sur l'écran d'accueil" <div className="inline-block w-4 h-4 bg-white/20 rounded ml-1 align-middle border border-white"></div></span>  {/* Rough icon representation */}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={16} />
                        Installer maintenant
                    </button>
                )}
            </div>
        </div>
    );
}
