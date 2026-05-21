import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Use vanilla service worker registration listener if vite-plugin-pwa virtual module is problematic,
// but for vite-plugin-pwa with 'prompt' strategy, virtual:pwa-register/react is the standard.
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-2xl border border-white/20"
      >
        <div className="flex items-start justify-between text-white">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <RefreshCw size={18} className="animate-spin-slow" />
              Update Available
            </h3>
            <p className="text-sm text-white/90">
              A new version of MoneyTracker is ready.
            </p>
          </div>
          <button 
            onClick={() => setNeedRefresh(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 py-2 bg-white text-emerald-900 font-medium rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            Refresh App
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
