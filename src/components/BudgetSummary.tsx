import React, { useState } from 'react';
import { Budget, Stone, EdgeFinish, ExtraService } from '../types';
import { FileSpreadsheet, Printer, Percent, Truck, Wrench, Sparkles, Plus, Trash2, ShieldCheck, DollarSign } from 'lucide-react';

interface BudgetSummaryProps {
  budget: Budget;
  stones: Stone[];
  edges: EdgeFinish[];
  
  // Update state helpers
  onUpdateBudget: React.Dispatch<React.SetStateAction<Budget>>;
  onExportExcel: () => void;
  onPrintPdf: () => void;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  budget,
  stones,
  edges,
  onUpdateBudget,
  onExportExcel,
  onPrintPdf,
}) => {
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState<string>('');

  // Handle number inputs securely
  const handleNumericFieldChange = (key: keyof Pick<Budget, 'installationPrice' | 'freightPrice' | 'discountPercent' | 'taxPercent'>, value: string) => {
    const num = parseFloat(value) || 0;
    onUpdateBudget(prev => {
      const updated = { ...prev, [key]: num };
      
      // Recalc discount amount
      if (key === 'discountPercent') {
        updated.discountAmount = updated.subtotal * (num / 100);
      }
      return updated;
    });
  };

  const handleAddExtraService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraName) return;
    const price = parseFloat(extraPrice) || 0;
    
    const newService: ExtraService = {
      id: Math.random().toString(36).substring(2, 9),
      name: extraName,
      price
    };

    onUpdateBudget(prev => ({
      ...prev,
      otherServices: [...prev.otherServices, newService]
    }));

    setExtraName('');
    setExtraPrice('');
  };

  const handleRemoveExtraService = (id: string) => {
    onUpdateBudget(prev => ({
      ...prev,
      otherServices: prev.otherServices.filter(s => s.id !== id)
    }));
  };

  // Group stones cost to display a beautiful visual breakdown/chart in the UI!
  const stoneCostMap: { [key: string]: { value: number; name: string; type: string } } = {};
  budget.items.forEach(item => {
    let name = '';
    let type = '';
    if (item.stoneId === 'custom') {
      name = item.customStoneName || 'Pedra Customizada';
      type = 'Outros';
    } else {
      const st = stones.find(s => s.id === item.stoneId);
      name = st?.name || 'Indefinido';
      type = st?.type || 'Outros';
    }
    const key = item.stoneId;
    if (!stoneCostMap[key]) {
      stoneCostMap[key] = { value: 0, name, type };
    }
    stoneCostMap[key].value += item.totalPrice;
  });

  const stoneBreakdowns = Object.values(stoneCostMap);
  const totalItemsSum = budget.subtotal;

  return (
    <div className="space-y-6">
      {/* Services and Adjustments Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 print:bg-white print:border-none print:p-0">
        
        {/* Adicionais & Serviços */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Serviços Logísticos & Adicionais
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  Mão de Obra de Instalação (R$)
                </label>
                <input
                  id="install-price-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={budget.installationPrice || ''}
                  onChange={(e) => handleNumericFieldChange('installationPrice', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-400" />
                  Frete / Transporte (R$)
                </label>
                <input
                  id="freight-price-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={budget.freightPrice || ''}
                  onChange={(e) => handleNumericFieldChange('freightPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Form to add custom items dynamically */}
            <form onSubmit={handleAddExtraService} className="border-t border-slate-200 pt-3 mt-1 space-y-2">
              <label className="block text-xs font-medium text-slate-600">Serviços sob Medida Especiais (Ex: Cuba Esculpida, Cuba Louça, Válvula)</label>
              <div className="flex gap-2">
                <input
                  id="extra-service-name"
                  type="text"
                  placeholder="Descrição do serviço/acessório"
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none"
                  value={extraName}
                  onChange={(e) => setExtraName(e.target.value)}
                />
                <input
                  id="extra-service-price"
                  type="number"
                  placeholder="Preço (R$)"
                  className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                  value={extraPrice}
                  onChange={(e) => setExtraPrice(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition cursor-pointer"
                  title="Inserir serviço"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* List of custom services */}
            {budget.otherServices.length > 0 && (
              <div className="space-y-1.5 max-h-24 overflow-y-auto pt-1">
                {budget.otherServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-center text-xs bg-white py-1 px-2.5 rounded border border-slate-200">
                    <span className="text-slate-600 truncate">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 font-mono">R$ {service.price.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraService(service.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Descontos, Impostos & Preços */}
        <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            Condições Comerciais e Desconto
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Desconto Comercial (%)</label>
                <input
                  id="discount-percent-input"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ex: 5"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-850 focus:outline-none"
                  value={budget.discountPercent || ''}
                  onChange={(e) => handleNumericFieldChange('discountPercent', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Encargo ou Taxa Extra (%)</label>
                <input
                  id="tax-percent-input"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none"
                  value={budget.taxPercent || ''}
                  onChange={(e) => handleNumericFieldChange('taxPercent', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notas ou Condições de Pagamento</label>
              <textarea
                id="general-notes-textarea"
                rows={2}
                placeholder="Ex: Pagamento 50% de sinal e 50% na entrega. Medição fina será feita no local. Prazo de fabricação e montagem de 15 dias úteis."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                value={budget.generalNotes || ''}
                onChange={(e) => onUpdateBudget(prev => ({ ...prev, generalNotes: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Cost Analysis Section and Table of totals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual progress bars - Stone distribution breakdown */}
        <div className="lg:col-span-1 bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distribuição de Custo por Material</h4>
            {stoneBreakdowns.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum item calculado no momento.</p>
            ) : (
              <div className="space-y-3">
                {stoneBreakdowns.map((stoneBreak) => {
                  const percentage = totalItemsSum > 0 ? (stoneBreak.value / totalItemsSum) * 100 : 0;
                  return (
                    <div key={stoneBreak.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span className="truncate max-w-[160px]" title={stoneBreak.name}>{stoneBreak.name}</span>
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{stoneBreak.type}</span>
                        <span>R$ {stoneBreak.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Segurança & Margem:</strong> Orçamento calculado com polimento polido e sobras de esquadrias embutidas.
            </div>
          </div>
        </div>

        {/* Final Financial Receipt Board */}
        <div className="lg:col-span-2 bg-slate-900 text-slate-200 p-6 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Resumo Geral de Valores</h4>
          
          <div className="space-y-2 text-xs max-w-md ml-auto">
            <div className="flex justify-between text-slate-400">
              <span>Soma dos tampos e peças:</span>
              <span className="font-mono text-slate-250">R$ {budget.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            {budget.installationPrice > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Mão de Obra (Instalação):</span>
                <span className="font-mono text-emerald-400">+ R$ {budget.installationPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {budget.freightPrice > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Transporte / Logística:</span>
                <span className="font-mono text-emerald-400">+ R$ {budget.freightPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {budget.otherServices.map((serv) => (
              <div key={serv.id} className="flex justify-between text-slate-400">
                <span>{serv.name}:</span>
                <span className="font-mono text-emerald-400">+ R$ {serv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}

            {budget.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Desconto Aplicado ({budget.discountPercent}%):</span>
                <span className="font-mono">- R$ {budget.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {budget.taxPercent > 0 && (
              <div className="flex justify-between text-slate-450">
                <span>Taxas / Adicionais comerciais ({budget.taxPercent}%):</span>
                <span className="font-mono text-rose-450">+ R$ {(budget.subtotal * (budget.taxPercent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-100">VALOR TOTAL DE VENDA:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                R$ {budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-end gap-3 print:hidden">
            <button
              id="print-budget-btn"
              type="button"
              onClick={onPrintPdf}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 transition text-slate-200 text-sm font-semibold rounded-lg shadow cursor-pointer border border-slate-705"
            >
              <Printer className="w-4 h-4 text-emerald-500" />
              Imprimir / PDF
            </button>
            <button
              id="export-excel-btn"
              type="button"
              onClick={onExportExcel}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition text-white text-sm font-bold rounded-lg shadow-md cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar para Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
