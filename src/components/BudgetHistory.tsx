import React, { useState } from 'react';
import { Budget } from '../types';
import { History, ArrowRight, Trash2, FolderOpen, Calendar, CircleDollarSign } from 'lucide-react';

interface BudgetHistoryProps {
  onLoadBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetHistory: React.FC<BudgetHistoryProps> = ({
  onLoadBudget,
  onDeleteBudget,
}) => {
  const [savedBudgets, setSavedBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('marmoraria_budgets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Refresh saved lists
  const handleRefresh = () => {
    try {
      const saved = localStorage.getItem('marmoraria_budgets');
      setSavedBudgets(saved ? JSON.parse(saved) : []);
    } catch {
      setSavedBudgets([]);
    }
  };

  // Re-run whenever localStorage operations happen externally (such as save)
  React.useEffect(() => {
    // Listen to custom local storage event or window focus
    window.addEventListener('storage', handleRefresh);
    const interval = setInterval(handleRefresh, 1500); // Polling for fast sync
    return () => {
      window.removeEventListener('storage', handleRefresh);
      clearInterval(interval);
    };
  }, []);

  const handleClearAll = () => {
    if (confirm('Tem certeza de que deseja apagar permanentemente TODO o histórico de orçamentos?')) {
      localStorage.removeItem('marmoraria_budgets');
      handleRefresh();
    }
  };

  if (savedBudgets.length === 0) {
    return null; // hide if empty to avoid clutter, or show subtle hint
  }

  return (
    <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4 print:hidden">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          Histórico de Orçamentos Salvos ({savedBudgets.length})
        </h3>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-56 overflow-y-auto pr-1">
        {savedBudgets.map((historyItem) => (
          <div 
            key={historyItem.id} 
            className="flex flex-col justify-between p-3.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-555 hover:shadow-xs transition space-y-2.5"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-black text-slate-800">{historyItem.code}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(historyItem.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-700 mt-1 truncate">
                {historyItem.customer.name || 'Cliente sem nome'}
              </h4>
              <p className="text-[10px] text-slate-400">
                {historyItem.items.length} peça{historyItem.items.length !== 1 ? 's' : ''} • {historyItem.salesperson ? `Vendedor: ${historyItem.salesperson}` : 'Sem consultor'}
              </p>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-2 bg-slate-50/50 -mx-3.5 -mb-3.5 p-2 px-3.5 rounded-b-lg">
              <span className="text-xs font-bold text-emerald-600 font-mono">
                R$ {historyItem.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDeleteBudget(historyItem.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Excluir histórico"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onLoadBudget(historyItem)}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Abrir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
