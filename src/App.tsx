import React, { useState, useEffect } from 'react';
import { CustomerInfo, Budget, Stone, EdgeFinish, BudgetItem } from './types';
import { DEFAULT_STONES, DEFAULT_EDGES, generateBudgetCode } from './data';
import { BudgetForm } from './components/BudgetForm';
import { ItemManager } from './components/ItemManager';
import { BudgetSummary } from './components/BudgetSummary';
import { BudgetHistory } from './components/BudgetHistory';
import { exportBudgetToExcel } from './utils/excelExport';

// Icons
import { 
  Calculator, Settings2, Plus, Trash2, RotateCcw, 
  Save, Sparkles, Sliders, Info, ScrollText, CheckCircle2, FileSpreadsheet, ArrowLeftRight
} from 'lucide-react';

export default function App() {
  // State 1: Active customer info
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
  });

  // State 2: Active budget metadata
  const [budgetMeta, setBudgetMeta] = useState({
    code: generateBudgetCode(),
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days default
    salesperson: '',
    generalNotes: '',
  });

  // State 3: Stone catalogue list (stored in local storage to allow price changing)
  const [stones, setStones] = useState<Stone[]>(() => {
    try {
      const x = localStorage.getItem('marmoraria_stones_v1');
      return x ? JSON.parse(x) : DEFAULT_STONES;
    } catch {
      return DEFAULT_STONES;
    }
  });

  // State 4: Edge finishes prices (stored in local storage to allow price changing)
  const [edges, setEdges] = useState<EdgeFinish[]>(() => {
    try {
      const x = localStorage.getItem('marmoraria_edges_v1');
      return x ? JSON.parse(x) : DEFAULT_EDGES;
    } catch {
      return DEFAULT_EDGES;
    }
  });

  // State 5: Active items in the quotation
  const [items, setItems] = useState<BudgetItem[]>([]);

  // State 6: Financial totals, extras
  const [installationPrice, setInstallationPrice] = useState<number>(0);
  const [freightPrice, setFreightPrice] = useState<number>(0);
  const [otherServices, setOtherServices] = useState<Budget['otherServices']>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  // Configuration management state
  const [showConfig, setShowConfig] = useState(false);
  const [newStoneName, setNewStoneName] = useState('');
  const [newStoneType, setNewStoneType] = useState<Stone['type']>('Granito');
  const [newStonePrice, setNewStonePrice] = useState<string>('');
  const [newStoneDesc, setNewStoneDesc] = useState('');

  // Show Toast / Success states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Persist customized stones / edges change
  useEffect(() => {
    localStorage.setItem('marmoraria_stones_v1', JSON.stringify(stones));
  }, [stones]);

  useEffect(() => {
    localStorage.setItem('marmoraria_edges_v1', JSON.stringify(edges));
  }, [edges]);

  // Load draft budget from local storage on mount (optional, nice for usability)
  useEffect(() => {
    try {
      const draft = localStorage.getItem('marmoraria_draft');
      if (draft) {
        const d = JSON.parse(draft);
        setCustomer(d.customer || { name: '', phone: '', email: '', city: '', address: '' });
        setBudgetMeta(prev => ({
          ...prev,
          code: d.code || generateBudgetCode(),
          salesperson: d.salesperson || '',
          generalNotes: d.generalNotes || '',
        }));
        setItems(d.items || []);
        setInstallationPrice(d.installationPrice || 0);
        setFreightPrice(d.freightPrice || 0);
        setOtherServices(d.otherServices || []);
        setDiscountPercent(d.discountPercent || 0);
        setDiscountAmount(d.discountAmount || 0);
        setTaxPercent(d.taxPercent || 0);
      }
    } catch (e) {
      console.log('Failing to load draft', e);
    }
  }, []);

  // Sync draft as they change
  useEffect(() => {
    const draft = {
      customer,
      code: budgetMeta.code,
      salesperson: budgetMeta.salesperson,
      generalNotes: budgetMeta.generalNotes,
      items,
      installationPrice,
      freightPrice,
      otherServices,
      discountPercent,
      discountAmount,
      taxPercent
    };
    localStorage.setItem('marmoraria_draft', JSON.stringify(draft));
  }, [customer, budgetMeta, items, installationPrice, freightPrice, otherServices, discountPercent, discountAmount, taxPercent]);

  // Core Math - calculate dynamic budget object
  const calculateBudget = (): Budget => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Services sum
    const servicesSum = installationPrice + freightPrice + otherServices.reduce((sum, s) => sum + s.price, 0);
    
    // Base amount to taxable
    const baseBeforeDiscount = subtotal + servicesSum;
    
    // Calc discount
    let finalDiscount = discountAmount;
    if (discountPercent > 0) {
      finalDiscount = subtotal * (discountPercent / 100);
    }
    
    // Calc tax
    const finalTax = subtotal * (taxPercent / 100);
    
    const finalTotal = Math.max(0, baseBeforeDiscount - finalDiscount + finalTax);

    return {
      id: budgetMeta.code, // use code as default ID
      code: budgetMeta.code,
      date: budgetMeta.date,
      validUntil: budgetMeta.validUntil,
      salesperson: budgetMeta.salesperson,
      customer,
      items,
      installationPrice,
      freightPrice,
      otherServices,
      discountPercent,
      discountAmount: finalDiscount,
      taxPercent,
      generalNotes: budgetMeta.generalNotes,
      subtotal,
      total: finalTotal
    };
  };

  const activeBudget = calculateBudget();

  // Load a budget from historical list
  const handleLoadBudget = (loaded: Budget) => {
    setCustomer(loaded.customer);
    setBudgetMeta({
      code: loaded.code,
      date: loaded.date,
      validUntil: loaded.validUntil,
      salesperson: loaded.salesperson,
      generalNotes: loaded.generalNotes || '',
    });
    setItems(loaded.items);
    setInstallationPrice(loaded.installationPrice || 0);
    setFreightPrice(loaded.freightPrice || 0);
    setOtherServices(loaded.otherServices || []);
    setDiscountPercent(loaded.discountPercent || 0);
    setDiscountAmount(loaded.discountAmount || 0);
    setTaxPercent(loaded.taxPercent || 0);
    showToast(`Orçamento ${loaded.code} carregado com sucesso!`);
  };

  // Add budget manually to history
  const handleSaveBudgetToHistory = () => {
    if (!customer.name) {
      alert('Por favor, informe pelo menos o Nome do Cliente para arquivar o orçamento.');
      return;
    }
    try {
      const raw = localStorage.getItem('marmoraria_budgets');
      const list: Budget[] = raw ? JSON.parse(raw) : [];
      
      // Update or insert
      const existsIdx = list.findIndex(b => b.code === activeBudget.code);
      if (existsIdx > -1) {
        list[existsIdx] = activeBudget;
        showToast(`Orçamento comercial ${activeBudget.code} atualizado na lista!`);
      } else {
        list.unshift(activeBudget); // insert at first
        showToast(`Orçamento comercial ${activeBudget.code} salvo com sucesso!`);
      }
      
      localStorage.setItem('marmoraria_budgets', JSON.stringify(list));
      
      // Force trigger state reload on History component
      window.dispatchEvent(new Event('storage'));
    } catch {
      alert('Falha ao salvar no histórico.');
    }
  };

  // Force clean sheet
  const handleCreateNewClearBudget = () => {
    if (confirm('Deseja iniciar um novo orçamento em branco? O rascunho atual será limpo.')) {
      setCustomer({ name: '', phone: '', email: '', city: '', address: '' });
      setBudgetMeta({
        code: generateBudgetCode(),
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        salesperson: '',
        generalNotes: '',
      });
      setItems([]);
      setInstallationPrice(0);
      setFreightPrice(0);
      setOtherServices([]);
      setDiscountPercent(0);
      setDiscountAmount(0);
      setTaxPercent(0);
      showToast('Novo orçamento limpo inicializado.');
    }
  };

  const handleDeleteBudgetFromHistory = (id: string) => {
    try {
      const raw = localStorage.getItem('marmoraria_budgets');
      if (raw) {
        const list: Budget[] = JSON.parse(raw);
        const filtered = list.filter(b => b.id !== id);
        localStorage.setItem('marmoraria_budgets', JSON.stringify(filtered));
        window.dispatchEvent(new Event('storage'));
        showToast('Orçamento excluído do histórico.');
      }
    } catch {
      console.log('Error deleting budget');
    }
  };

  // Export excel
  const handleExportExcel = () => {
    if (items.length === 0) {
      alert('Adicione pelo menos 1 peça ao orçamento para exportar.');
      return;
    }
    exportBudgetToExcel(activeBudget, stones, edges);
    showToast('Planilha Excel (.xlsx) baixada com sucesso!');
  };

  // Print PDF Trigger
  const handlePrintPdf = () => {
    window.print();
  };

  // Custom stone list adjustments
  const handleAddCustomStonePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoneName || parseFloat(newStonePrice) <= 0) return;

    const added: Stone = {
      id: 'stone_' + Math.random().toString(36).substring(2, 9),
      name: `Pedra ${newStoneName}`,
      type: newStoneType,
      pricePerSqm: parseFloat(newStonePrice),
      description: newStoneDesc || undefined
    };

    setStones(prev => [...prev.filter(s => s.id !== 'custom'), added, prev.find(s => s.id === 'custom')!]);
    setNewStoneName('');
    setNewStonePrice('');
    setNewStoneDesc('');
    showToast(`Material "${newStoneName}" adicionado ao catálogo!`);
  };

  const handleDeleteStonePreset = (id: string) => {
    if (id === 'custom') return; // Cannot delete fallback
    setStones(prev => prev.filter(s => s.id !== id));
    showToast(`Material removido do catálogo.`);
  };

  const handleUpdateEdgePrice = (id: string, price: number) => {
    setEdges(prev => prev.map(e => e.id === id ? { ...e, pricePerMeter: price } : e));
    showToast(`Valor do polimento atualizado.`);
  };

  return (
    <div id="root-container" className="min-h-screen bg-slate-100 text-slate-800 pb-12 font-sans selection:bg-emerald-500 selection:text-white print:bg-white print:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border-l-4 border-emerald-500 text-emerald-100 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-xs animate-slide-in font-medium max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-8 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-emerald-500/10">
              <Calculator className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Marmoraria Corte Fino</h1>
              <p className="text-xs text-slate-400 font-medium">Gerador de Orçamentos de Bancadas, Soleiras & Cubas</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <button
              id="config-toggle-btn"
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                showConfig 
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-750 text-slate-300'
              } cursor-pointer`}
            >
              <Settings2 className="w-4 h-4" />
              Tabela de Preços (m²)
            </button>

            <button
              id="new-budget-btn"
              type="button"
              onClick={handleCreateNewClearBudget}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Novo Orçamento
            </button>

            <button
              id="save-history-btn"
              type="button"
              onClick={handleSaveBudgetToHistory}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Comercial
            </button>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE PANEL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-8">
        
        {/* Dynamic customized pricing administrator drawer */}
        {showConfig && (
          <div className="bg-white border border-slate-350 p-6 rounded-xl space-y-6 shadow-sm animate-fade-in print:hidden">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  Gerenciador de Materiais e Acabamentos
                </h3>
                <p className="text-xs text-slate-500">Configure os valores padrão que a marmoraria cobra na sua região.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowConfig(false)} 
                className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold"
              >
                Fechar Painel
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Custom Rocks Form */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Inserir Pedra ao Catálogo</h4>
                <form onSubmit={handleAddCustomStonePreset} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Nome da Pedra (Ex: Granito Amarelo Icaraí)</label>
                    <input
                      id="new-stone-name-input"
                      type="text"
                      required
                      placeholder="Ex: Granito Amarelo Icaraí"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      value={newStoneName}
                      onChange={(e) => setNewStoneName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Classificação</label>
                      <select
                        id="new-stone-type-select"
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs cursor-pointer"
                        value={newStoneType}
                        onChange={(e) => setNewStoneType(e.target.value as Stone['type'])}
                      >
                        <option value="Granito">Granito</option>
                        <option value="Mármore">Mármore</option>
                        <option value="Quartzo">Quartzo</option>
                        <option value="Industrial">Ultracompacto</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">R$ Preço / m²</label>
                      <input
                        id="new-stone-price-input"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="Ex: 450"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        value={newStonePrice}
                        onChange={(e) => setNewStonePrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Tonalidade / Detalhes (Opcional)</label>
                    <input
                      id="new-stone-desc-input"
                      type="text"
                      placeholder="E.g., Granulado marrom médio, importado"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      value={newStoneDesc}
                      onChange={(e) => setNewStoneDesc(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar ao Catálogo
                  </button>
                </form>
              </div>

              {/* Stones List */}
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider">Rocha & Sintéticos Cadastrados</h4>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100 bg-white">
                  {stones.map((st) => (
                    <div key={st.id} className="p-2.5 flex justify-between items-center text-xs hover:bg-slate-50 transition">
                      <div>
                        <span className="font-semibold text-slate-800">{st.name}</span>
                        <span className="block text-[10px] text-slate-400">{st.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-emerald-700 font-mono">R$ {st.pricePerSqm.toFixed(2)}/m²</strong>
                        {st.id !== 'custom' ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteStonePreset(st.id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Remover do catálogo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-medium bg-amber-50">Fallback</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge polishing edit */}
              <div className="lg:col-span-1 space-y-3">
                <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider">Acabamento de Quinas (Lineares)</h4>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100 bg-white">
                  {edges.map((ed) => (
                    <div key={ed.id} className="p-2.5 flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 max-w-[120px] truncate">{ed.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">R$/metro</span>
                        <input
                          type="number"
                          className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right font-mono"
                          value={ed.pricePerMeter}
                          onChange={(e) => handleUpdateEdgePrice(ed.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Budgets List of Local Storage */}
        <BudgetHistory 
          onLoadBudget={handleLoadBudget} 
          onDeleteBudget={handleDeleteBudgetFromHistory} 
        />

        {/* Section 1: Customer Form */}
        <section id="form-section-customer" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 bg-slate-900/5 px-6 py-4 flex justify-between items-center print:hidden">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-emerald-600" />
              1. Informações Básicas do Orçamento
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">CÓDIGO: {budgetMeta.code}</span>
          </div>
          <div className="p-6">
            <BudgetForm
              customer={customer}
              setCustomer={setCustomer}
              budgetMeta={budgetMeta}
              setBudgetMeta={setBudgetMeta}
            />
          </div>
        </section>

        {/* Section 2: Items list manager */}
        <section id="form-section-items" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <ItemManager
            items={items}
            setItems={setItems}
            stones={stones}
            edges={edges}
          />
        </section>

        {/* Section 3: Totals, shipping, installation and triggers */}
        <section id="form-section-summary" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <BudgetSummary
            budget={activeBudget}
            stones={stones}
            edges={edges}
            onUpdateBudget={(updater) => {
              // Workaround to update component states from inner child updates
              if (typeof updater === 'function') {
                const next = updater(activeBudget);
                setInstallationPrice(next.installationPrice);
                setFreightPrice(next.freightPrice);
                setOtherServices(next.otherServices);
                setDiscountPercent(next.discountPercent);
                setDiscountAmount(next.discountAmount);
                setTaxPercent(next.taxPercent);
                setBudgetMeta(prev => ({ ...prev, generalNotes: next.generalNotes || '' }));
              }
            }}
            onExportExcel={handleExportExcel}
            onPrintPdf={handlePrintPdf}
          />
        </section>

        {/* PRINT SPECIFIC WORKVIEW SHEET (Invisible on Screen, Visible on paper/pdf printing) */}
        <div className="hidden print:block font-serif max-w-4xl mx-auto p-4 space-y-6 text-black bg-white">
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">Marmoraria Corte Fino</h1>
              <p className="text-xs italic text-slate-500">Qualidade de corte refinado em mármores, granitos e quartzos</p>
              <p className="text-xs text-slate-600 mt-1">Contato: contato@marmorariacortefino.com.br</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">Orçamento de Venda</h2>
              <p className="text-sm font-mono font-bold">Código: {activeBudget.code}</p>
              <p className="text-xs text-slate-600">Emissão: {new Date(activeBudget.date).toLocaleDateString('pt-BR')}</p>
              <p className="text-xs text-slate-600">Validade: {new Date(activeBudget.validUntil).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 p-3 rounded bg-slate-50">
            <div>
              <h3 className="font-bold border-b border-slate-300 pb-1 mb-1 uppercase">Dados do Cliente</h3>
              <p><strong>Nome:</strong> {activeBudget.customer.name || 'Geral'}</p>
              <p><strong>Telefone:</strong> {activeBudget.customer.phone || '-'}</p>
              <p><strong>Email:</strong> {activeBudget.customer.email || '-'}</p>
              <p><strong>Endereço:</strong> {activeBudget.customer.address || '-'}</p>
              <p><strong>Cidade:</strong> {activeBudget.customer.city || '-'}</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold border-b border-slate-300 pb-1 mb-1 uppercase">Informações da Venda</h3>
              <p><strong>Vendedor / Consultor:</strong> {activeBudget.salesperson || 'Marmoraria Corte Fino'}</p>
              <p><strong>Método de Medição:</strong> Medição fina no local após fechamento das alvenarias</p>
              <p><strong>Prazo de Entrega:</strong> 15 dias úteis úteis do aval de medição.</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase mb-1.5 border-b-2 border-slate-800 pb-1">Relação de Peças sob Medida</h3>
            <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 uppercase border-b border-slate-300">
                  <th className="p-2 border border-slate-350">Ambiente/Peça</th>
                  <th className="p-2 border border-slate-350">Material</th>
                  <th className="p-2 border border-slate-350 text-center">Medidas (m)</th>
                  <th className="p-2 border border-slate-350 text-center">Área Unit</th>
                  <th className="p-2 border border-slate-350 text-center">Qtd</th>
                  <th className="p-2 border border-slate-350">Acabamento/Adicionais</th>
                  <th className="p-2 border border-slate-350 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {activeBudget.items.map((item) => {
                  const s = stones.find(stone => stone.id === item.stoneId);
                  const isCustom = item.stoneId === 'custom';
                  const sName = isCustom ? item.customStoneName : s?.name;
                  const edge = edges.find(ed => ed.id === item.edgeFinishId);
                  
                  return (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="p-2 font-bold border border-slate-300">
                        {item.environment}
                        {item.observation && (
                          <div className="text-[8px] text-slate-500 italic mt-0.5">Obs: {item.observation}</div>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300">{sName}</td>
                      <td className="p-2 text-center font-mono border border-slate-300">{item.length.toFixed(2)}x{item.width.toFixed(2)}m</td>
                      <td className="p-2 text-center font-mono border border-slate-300">{(item.length * item.width).toFixed(3)}m²</td>
                      <td className="p-2 text-center font-mono border border-slate-300">{item.quantity}</td>
                      <td className="p-2 text-[9px] text-slate-600 border border-slate-300">
                        <div>Borda: {edge?.name}</div>
                        {item.backsplashLength ? <div>Frontão: {item.backsplashLength}m (A:{item.backsplashHeight}m)</div> : null}
                        {item.apronLength ? <div>Saia: {item.apronLength}m (A:{item.apronHeight}m)</div> : null}
                        {(item.undermountSinkCutouts > 0 || item.cooktopCutouts > 0) ? (
                          <div>Furos: {item.undermountSinkCutouts > 0 ? `${item.undermountSinkCutouts}x Cuba ` : ''}{item.cooktopCutouts > 0 ? `${item.cooktopCutouts}x Cook` : ''}</div>
                        ) : null}
                      </td>
                      <td className="p-2 text-right border border-slate-300 font-mono font-semibold">R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-start gap-8 pt-4">
            <div className="w-1/2 text-[10px] space-y-1.5 text-slate-600">
              <h4 className="font-bold border-b border-slate-300 pb-1 text-black uppercase">Termos & Observações Gerais</h4>
              <p>1. As alvenarias e marcenarias de suporte devem estar travadas no local antes da instalação das pedras.</p>
              <p>2. Os equipamentos (cuba, torneira, válvula, cooktop) devem estar fisicamente presentes na obra para instalação.</p>
              <p>3. Não estão inclusos serviços de hidráulica, elétrica ou marcenaria estrutural.</p>
              {activeBudget.generalNotes && (
                <div className="mt-2 text-black p-2 bg-slate-50 border rounded">
                  <strong>Mensagem Adicional:</strong> {activeBudget.generalNotes}
                </div>
              )}
            </div>

            <div className="w-1/2 space-y-1 text-xs">
              <div className="flex justify-between border-b pb-1 text-slate-700">
                <span>Subtotal Itens:</span>
                <span className="font-mono">R$ {activeBudget.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {(activeBudget.installationPrice > 0) && (
                <div className="flex justify-between border-b pb-1 text-slate-700">
                  <span>Mão de Obra de Instalação:</span>
                  <span className="font-mono">R$ {activeBudget.installationPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {(activeBudget.freightPrice > 0) && (
                <div className="flex justify-between border-b pb-1 text-slate-700">
                  <span>Frete / Logística:</span>
                  <span className="font-mono">R$ {activeBudget.freightPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {activeBudget.otherServices.map((serv) => (
                <div key={serv.id} className="flex justify-between border-b pb-1 text-slate-700">
                  <span>{serv.name}:</span>
                  <span className="font-mono">R$ {serv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              {(activeBudget.discountAmount > 0) && (
                <div className="flex justify-between border-b pb-1 text-emerald-800 font-bold">
                  <span>Desconto ({activeBudget.discountPercent}%):</span>
                  <span className="font-mono">- R$ {activeBudget.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {(activeBudget.taxPercent > 0) && (
                <div className="flex justify-between border-b pb-1 text-slate-700">
                  <span>Impostos / Taxas comerciais ({activeBudget.taxPercent}%):</span>
                  <span className="font-mono">R$ {(activeBudget.subtotal * (activeBudget.taxPercent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between border-b-2 border-slate-800 py-3 text-sm font-black bg-slate-100 p-2 rounded">
                <span>VALOR TOTAL DO ORÇAMENTO:</span>
                <span className="font-mono text-emerald-400">R$ {activeBudget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="pt-8 text-center space-y-4">
                <div className="border-t border-slate-400 w-2/3 mx-auto mt-4"></div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Assinatura do Cliente / Aceite Comercial</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
