import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if it's already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Android / Desktop Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|crmo/.test(userAgent);
    
    if (isIosDevice && isSafari && !('standalone' in window.navigator && (window.navigator as any).standalone)) {
      setIsIos(true);
      setShowPrompt(true);
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
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 p-4 rounded-2xl bg-[#0b1329]/90 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/5 flex items-center justify-center">
              <img src="/pwa-192x192.png" alt="Logo" className="w-8 h-8 rounded-lg" />
            </div>
            <div>
              <h3 className="text-white font-medium">Install MoneyTracker</h3>
              <p className="text-sm text-gray-400">
                {isIos ? "Add to Home Screen for offline use." : "Install for the best experience."}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowPrompt(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mt-4">
          {isIos ? (
            <div className="flex items-center justify-center gap-2 text-sm text-cyan-400 bg-cyan-400/10 py-2 px-4 rounded-xl border border-cyan-400/20">
              Tap <Share size={16} /> then "Add to Home Screen"
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
            >
              <Download size={18} />
              Install App
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
