import React, { useState } from 'react';
import { AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DemoDataBanner: React.FC = () => {
  const { t, resetDemoData, isLoading } = useApp();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-amber-500 text-slate-950 text-xs sm:text-sm font-semibold px-3 py-1.5 shadow-sm border-b border-amber-600">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-black text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            DEMO PROTOTYPE
          </span>
          <span className="text-slate-900 font-medium">
            {t.demoBanner}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="underline hover:text-slate-950 flex items-center gap-1 font-medium cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            {showDetails ? 'Hide Details' : 'Prototype Info'}
          </button>
          <span className="text-amber-800">|</span>
          <button
            onClick={resetDemoData}
            disabled={isLoading}
            className="flex items-center gap-1 bg-slate-900/10 hover:bg-slate-900/20 text-slate-950 px-2 py-0.5 rounded transition font-medium cursor-pointer"
            title="Reset synthetic incidents, responders, and ghats to initial state"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Reset Demo Data
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-amber-600/40 text-xs text-slate-900 font-normal grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <span className="font-bold">Synthetic Geolocation:</span> Rajahmundry & Kovvur Godavari Pushkaralu Ghats (~17.00° N, 81.77° E).
          </div>
          <div>
            <span className="font-bold">AI Dispatch Engine:</span> Server-Side Google Gemini 3.8 Flash with deterministic fallback.
          </div>
          <div>
            <span className="font-bold">Important:</span> No real emergency services or official dispatch systems are contacted by this prototype.
          </div>
        </div>
      )}
    </div>
  );
};
