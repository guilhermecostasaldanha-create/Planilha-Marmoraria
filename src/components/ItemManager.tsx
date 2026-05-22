import React, { useState, useEffect } from 'react';
import { BudgetItem, Stone, EdgeFinish } from '../types';
import { calculateItemTotal, STANDARD_COSTS } from '../data';
import { 
  Plus, Trash2, Edit3, Save, X, Hammer, Layers, HelpCircle, AlertCircle, Info, ArrowUpRight
} from 'lucide-react';

interface ItemManagerProps {
  items: BudgetItem[];
  setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  stones: Stone[];
  edges: EdgeFinish[];
}

const ENVIRONMENT_PRESETS = [
  'Cozinha',
  'Área Gourmet',
  'Suíte Master',
  'Banheiro Social',
  'Soleiras',
  'Escada',
  'Lavabo',
  'Fachada',
  'Lareira',
];

export const ItemManager: React.FC<ItemManagerProps> = ({
  items,
  setItems,
  stones,
  edges,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [environment, setEnvironment] = useState('Cozinha');
  const [stoneId, setStoneId] = useState(stones[0].id);
  const [customStoneName, setCustomStoneName] = useState('');
  const [customStonePrice, setCustomStonePrice] = useState(0);
  
  const [length, setLength] = useState<string>('1.80');
  const [width, setWidth] = useState<string>('0.60');
  const [quantity, setQuantity] = useState<number>(1);
  
  const [hasBacksplash, setHasBacksplash] = useState(false);
  const [backsplashLength, setBacksplashLength] = useState<string>('1.80');
  const [backsplashHeight, setBacksplashHeight] = useState<string>('0.10');
  
  const [hasApron, setHasApron] = useState(false);
  const [apronLength, setApronLength] = useState<string>('1.80');
  const [apronHeight, setApronHeight] = useState<string>('0.04');
  
  const [edgeFinishId, setEdgeFinishId] = useState(edges[0].id);
  const [edgeFinishLength, setEdgeFinishLength] = useState<string>('1.80');
  
  const [undermountSinkCutouts, setUndermountSinkCutouts] = useState<number>(0);
  const [cooktopCutouts, setCooktopCutouts] = useState<number>(0);
  const [tapHoles, setTapHoles] = useState<number>(0);
  
  const [observation, setObservation] = useState('');

  // Watch length changes to autofill backsplash, apron and edge polish lengths by default
  useEffect(() => {
    if (length) {
      setBacksplashLength(length);
      setApronLength(length);
      setEdgeFinishLength(length);
    }
  }, [length]);

  const resetForm = () => {
    setEnvironment('Cozinha');
    setStoneId(stones[0].id);
    setCustomStoneName('');
    setCustomStonePrice(0);
    setLength('1.80');
    setWidth('0.60');
    setQuantity(1);
    setHasBacksplash(false);
    setBacksplashLength('1.80');
    setBacksplashHeight('0.10');
    setHasApron(false);
    setApronLength('1.80');
    setApronHeight('0.04');
    setEdgeFinishId(edges[0].id);
    setEdgeFinishLength('1.80');
    setUndermountSinkCutouts(0);
    setCooktopCutouts(0);
    setTapHoles(0);
    setObservation('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleEditClick = (item: BudgetItem) => {
    setEditingId(item.id);
    setEnvironment(item.environment);
    setStoneId(item.stoneId);
    setCustomStoneName(item.customStoneName || '');
    setCustomStonePrice(item.customStonePrice || 0);
    setLength(item.length.toString());
    setWidth(item.width.toString());
    setQuantity(item.quantity);
    
    // Backsplash logic
    const bLength = item.backsplashLength || 0;
    setHasBacksplash(bLength > 0);
    setBacksplashLength(bLength > 0 ? bLength.toString() : item.length.toString());
    setBacksplashHeight((item.backsplashHeight || 0.10).toString());

    // Apron logic
    const aLength = item.apronLength || 0;
    setHasApron(aLength > 0);
    setApronLength(aLength > 0 ? aLength.toString() : item.length.toString());
    setApronHeight((item.apronHeight || 0.04).toString());

    setEdgeFinishId(item.edgeFinishId);
    setEdgeFinishLength((item.edgeFinishLength ?? item.length).toString());
    setUndermountSinkCutouts(item.undermountSinkCutouts);
    setCooktopCutouts(item.cooktopCutouts);
    setTapHoles(item.tapHoles);
    setObservation(item.observation || '');
    
    setIsAdding(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    const partialItem: Partial<BudgetItem> = {
      id: editingId || undefined,
      environment,
      stoneId,
      customStoneName: stoneId === 'custom' ? customStoneName : undefined,
      customStonePrice: stoneId === 'custom' ? customStonePrice : undefined,
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      quantity: quantity || 1,
      backsplashLength: hasBacksplash ? (parseFloat(backsplashLength) || 0) : 0,
      backsplashHeight: hasBacksplash ? (parseFloat(backsplashHeight) || 0.10) : 0,
      apronLength: hasApron ? (parseFloat(apronLength) || 0) : 0,
      apronHeight: hasApron ? (parseFloat(apronHeight) || 0.04) : 0,
      edgeFinishId,
      edgeFinishLength: parseFloat(edgeFinishLength) || 0,
      undermountSinkCutouts,
      cooktopCutouts,
      tapHoles,
      observation
    };

    const evaluated = calculateItemTotal(partialItem, stones, edges);

    if (editingId) {
      setItems(prev => prev.map(item => item.id === editingId ? evaluated : item));
    } else {
      setItems(prev => [...prev, evaluated]);
    }

    resetForm();
    setIsAdding(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Tem certeza de que deseja remover esta peça do orçamento?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const currentStoneObj = stones.find(s => s.id === stoneId);
  const activePricePerSqm = stoneId === 'custom' ? customStonePrice : (currentStoneObj?.pricePerSqm || 0);

  // Quick preset helper
  const applySizePreset = (l: string, w: string) => {
    setLength(l);
    setWidth(w);
  };

  return (
    <div className="space-y-6">
      {/* Header section inside item list container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Peças e Peitoris do Orçamento
          </h2>
          <p className="text-xs text-slate-500">Adicione as medições de tampos, bancadas, rodapés e cubas do projeto.</p>
        </div>
        
        {!isAdding && (
          <button
            id="add-item-trigger"
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:transform active:scale-95 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Peça / Medida
          </button>
        )}
      </div>

      {/* Edit/Add Form Sheet */}
      {isAdding && (
        <form onSubmit={handleSaveItem} className="bg-white border-2 border-emerald-500/30 p-6 rounded-xl shadow-lg space-y-6 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-150 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">
              {editingId ? 'Editar Detalhes da Peça' : 'Nova Peça para Cálculo'}
            </h3>
            <p className="text-xs text-slate-500">Preencha as dimensões exatas de fabricação.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* AMBIENTE & MATERIAL */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Local & Matéria-Prima</h4>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ambiente / Cômodo</label>
                <input
                  id="item-env-input"
                  type="text"
                  required
                  placeholder="Ex: Bancada Pia, Soleira Portal, Nicho Banho"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  list="env-presets"
                />
                <datalist id="env-presets">
                  {ENVIRONMENT_PRESETS.map(p => <option key={p} value={p} />)}
                </datalist>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {ENVIRONMENT_PRESETS.slice(0, 5).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEnvironment(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition ${
                        environment === preset 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pedra / Material</label>
                <select
                  id="item-stone-select"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
                  value={stoneId}
                  onChange={(e) => setStoneId(e.target.value)}
                >
                  {stones.map(stone => (
                    <option key={stone.id} value={stone.id}>
                      {stone.name} {stone.pricePerSqm > 0 ? `(R$ ${stone.pricePerSqm.toFixed(2)}/m²)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {stoneId === 'custom' && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Nome da Pedra Customizada</label>
                    <input
                      id="custom-stone-name"
                      type="text"
                      required
                      placeholder="Ex: Mármore Rosso Alicante"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      value={customStoneName}
                      onChange={(e) => setCustomStoneName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Preço do m² (R$)</label>
                    <input
                      id="custom-stone-price"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      value={customStonePrice || ''}
                      onChange={(e) => setCustomStonePrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DIMENSÕES E QUANTIDADE */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Dimensões de Corte</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Comp. (Comprimento em metros)</label>
                  <input
                    id="item-length-input"
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    placeholder="Ex: 1.50"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Larg. (Largura em metros)</label>
                  <input
                    id="item-width-input"
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    placeholder="Ex: 0.60"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick dimension shortcuts for easy creation */}
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tamanhos Padrão:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => applySizePreset('0.82', '0.15')} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition">Soleira (0.8x0.15m)</button>
                  <button type="button" onClick={() => applySizePreset('1.20', '0.60')} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition">Lavatório (1.2x0.6m)</button>
                  <button type="button" onClick={() => applySizePreset('2.00', '0.60')} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition">Bancada Cozinha (2x0.6m)</button>
                  <button type="button" onClick={() => applySizePreset('1.80', '0.90')} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition">Ilha (1.8x0.9m)</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantidade de Peças</label>
                  <input
                    id="item-quantity-input"
                    type="number"
                    required
                    min="1"
                    placeholder="1"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="pt-4 text-center">
                  <span className="text-xs text-slate-500">Área Calculada:</span>
                  <span className="block font-semibold text-slate-800 text-base">
                    {((parseFloat(length) || 0) * (parseFloat(width) || 0) * quantity).toFixed(3)} m²
                  </span>
                </div>
              </div>
            </div>

            {/* ADICIONAIS DE FABRICAÇÃO: SAIA, FRONTÃO, ACABAMENTO, FUROS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Acabamento Borda & Adicionais</h4>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Perfil da Borda</label>
                <select
                  id="item-edge-select"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
                  value={edgeFinishId}
                  onChange={(e) => setEdgeFinishId(e.target.value)}
                >
                  {edges.map(ed => (
                    <option key={ed.id} value={ed.id}>
                      {ed.name} (+ R$ {ed.pricePerMeter.toFixed(2)}/m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Metros de Borda a Polir (m)</label>
                <input
                  id="item-edge-length-input"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  value={edgeFinishLength}
                  onChange={(e) => setEdgeFinishLength(e.target.value)}
                  placeholder="Metragem linear do acabamento"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
            {/* FRONTÃO E SAIA */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Frontão (Rodabanca) e Saia (Avental)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frontão / Rodabanca */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="has-backsplash-checkbox"
                      type="checkbox"
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      checked={hasBacksplash}
                      onChange={(e) => setHasBacksplash(e.target.checked)}
                    />
                    <span className="text-xs font-bold text-slate-700">Adicionar Frontão (Rodabanca)</span>
                  </label>
                  
                  {hasBacksplash && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-500">Comp. Linter (m)</label>
                        <input
                          id="backsplash-length"
                          type="number"
                          step="0.01"
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          value={backsplashLength}
                          onChange={(e) => setBacksplashLength(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Altura Padrão (m)</label>
                        <input
                          id="backsplash-height"
                          type="number"
                          step="0.01"
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          value={backsplashHeight}
                          onChange={(e) => setBacksplashHeight(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Saia / Avental */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="has-apron-checkbox"
                      type="checkbox"
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      checked={hasApron}
                      onChange={(e) => setHasApron(e.target.checked)}
                    />
                    <span className="text-xs font-bold text-slate-700">Adicionar Saia / Avental vertical</span>
                  </label>
                  
                  {hasApron && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-500">Comp. Linear (m)</label>
                        <input
                          id="apron-length"
                          type="number"
                          step="0.01"
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          value={apronLength}
                          onChange={(e) => setApronLength(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Altura Saia (m)</label>
                        <input
                          id="apron-height"
                          type="number"
                          step="0.01"
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          value={apronHeight}
                          onChange={(e) => setApronHeight(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FUROS EXTRA */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">5. Furos e Acessórios de Cuba</h4>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-semibold text-slate-500">Cuba Embutida</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setUndermountSinkCutouts(prev => Math.max(0, prev - 1))}
                      className="w-5 h-5 bg-white border rounded text-xs hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-slate-700">{undermountSinkCutouts}</span>
                    <button
                      type="button"
                      onClick={() => setUndermountSinkCutouts(prev => prev + 1)}
                      className="w-5 h-5 bg-white border rounded text-xs hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-1">R$ {STANDARD_COSTS.undermountSinkCutout.toFixed(0)}/un</span>
                </div>

                <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-semibold text-slate-500">Furo Cooktop</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setCooktopCutouts(prev => Math.max(0, prev - 1))}
                      className="w-5 h-5 bg-white border rounded text-xs hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-slate-700">{cooktopCutouts}</span>
                    <button
                      type="button"
                      onClick={() => setCooktopCutouts(prev => prev + 1)}
                      className="w-5 h-5 bg-white border rounded text-xs hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-1">R$ {STANDARD_COSTS.cooktopCutout.toFixed(0)}/un</span>
                </div>

                <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-semibold text-slate-500 font-sans">Furo Torneira</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setTapHoles(prev => Math.max(0, prev - 1))}
                      className="w-5 h-5 bg-white border rounded text-xs hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-slate-700">{tapHoles}</span>
                    <button
                      type="button"
                      onClick={() => setTapHoles(prev => prev + 1)}
                      className="w-5 h-5 bg-white border rounded text-xs hover:bg-slate-100 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="block text-[8px] text-slate-400 mt-1">R$ {STANDARD_COSTS.tapHole.toFixed(0)}/un</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Notas / Detalhes Customizados da Peça</label>
            <input
              id="item-observation-input"
              type="text"
              placeholder="Ex: Reforçar com barra de fibra; Cuba fornecida pelo cliente; Polimento duplo nas bordas laterais."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>

          {/* Calculator Preview Box */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Estimativa de Preço da Peça</span>
              <div className="flex gap-4 flex-wrap text-xs text-slate-300">
                <span>Material: R$ {((parseFloat(length) || 0) * (parseFloat(width) || 0) * activePricePerSqm).toFixed(2)}</span>
                {hasBacksplash && <span>Frontão: R$ {((parseFloat(backsplashLength) || 0) * (parseFloat(backsplashHeight) || 0.10) * activePricePerSqm + (parseFloat(backsplashLength) || 0) * 20).toFixed(2)}</span>}
                {hasApron && <span>Saia: R$ {((parseFloat(apronLength) || 0) * (parseFloat(apronHeight) || 0.04) * activePricePerSqm + (parseFloat(apronLength) || 0) * 30).toFixed(2)}</span>}
                <span>Polimento: R$ {((parseFloat(edgeFinishLength) || 0) * (edges.find(e => e.id === edgeFinishId)?.pricePerMeter || 0)).toFixed(2)}</span>
                {(undermountSinkCutouts > 0 || cooktopCutouts > 0 || tapHoles > 0) && (
                  <span>Serviços Extra: R$ {(
                    (undermountSinkCutouts * STANDARD_COSTS.undermountSinkCutout) + 
                    (cooktopCutouts * STANDARD_COSTS.cooktopCutout) + 
                    (tapHoles * STANDARD_COSTS.tapHole)
                  ).toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Total ({quantity}x unidade{quantity > 1 ? 's' : ''})</span>
              <span className="text-xl font-black text-emerald-400">
                R$ {(() => {
                  const pItem: Partial<BudgetItem> = {
                    length: parseFloat(length) || 0,
                    width: parseFloat(width) || 0,
                    quantity: quantity || 1,
                    stoneId,
                    customStoneName: stoneId === 'custom' ? customStoneName : undefined,
                    customStonePrice: stoneId === 'custom' ? customStonePrice : undefined,
                    backsplashLength: hasBacksplash ? (parseFloat(backsplashLength) || 0) : 0,
                    backsplashHeight: hasBacksplash ? (parseFloat(backsplashHeight) || 0.10) : 0,
                    apronLength: hasApron ? (parseFloat(apronLength) || 0) : 0,
                    apronHeight: hasApron ? (parseFloat(apronHeight) || 0.04) : 0,
                    edgeFinishId,
                    edgeFinishLength: parseFloat(edgeFinishLength) || 0,
                    undermountSinkCutouts,
                    cooktopCutouts,
                    tapHoles
                  };
                  return calculateItemTotal(pItem, stones, edges).totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Limpar / Cancelar
            </button>
            <button
              id="submit-item-btn"
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Salvar Alteração' : 'Adicionar ao Orçamento'}
            </button>
          </div>
        </form>
      )}

      {/* ITEMS LIST TABLE */}
      {items.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-55/30">
          <Hammer className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">Nenhum item adicionado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Abra o formulário de peças acima para simular comprimentos, acabamento de quina e calcular o valor com base na rocha.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition"
          >
            Adicionar minha primeira peça agora
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="px-4 py-3">Ambiente / Peça</th>
                  <th className="px-4 py-3">Pedra Selecionada</th>
                  <th className="px-4 py-3 text-center">Medidas (m)</th>
                  <th className="px-4 py-3 text-center">Área (m²)</th>
                  <th className="px-4 py-3 text-center">Qtd</th>
                  <th className="px-4 py-3">Acabamentos Adicionais</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-center print:hidden">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => {
                  const stoneObj = stones.find(s => s.id === item.stoneId);
                  const isCustomStone = item.stoneId === 'custom';
                  const stoneName = isCustomStone ? item.customStoneName : stoneObj?.name;
                  
                  const edgeObj = edges.find(e => e.id === item.edgeFinishId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800 space-y-1">
                        <div>{item.environment}</div>
                        {item.observation && (
                          <div className="text-[10px] text-amber-600 bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100 w-max flex items-center gap-1">
                            <Info className="w-3 h-3 flex-shrink-0" />
                            {item.observation}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-medium text-slate-700">{stoneName}</div>
                        <div className="text-[10px] text-slate-400">
                          {isCustomStone ? 'Tipo Customizado' : stoneObj?.type} - R$ {(isCustomStone ? (item.customStonePrice || 0) : (stoneObj?.pricePerSqm || 0)).toFixed(2)}/m²
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {item.length.toFixed(2)} x {item.width.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                        {item.materialAreaSqm.toFixed(3)} m²
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-800 font-semibold bg-slate-50/40">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 space-y-1 text-slate-500">
                        {/* Edge info */}
                        <div className="text-[10px]">
                          <strong>Borda:</strong> {edgeObj?.name} ({item.edgeFinishLength}m)
                        </div>
                        {/* Backsplash info */}
                        {item.backsplashLength ? (
                          <div className="text-[10px] text-emerald-700">
                            <strong>Frontão:</strong> {item.backsplashLength}m (Alt: {item.backsplashHeight}m)
                          </div>
                        ) : null}
                        {/* Apron saia info */}
                        {item.apronLength ? (
                          <div className="text-[10px] text-blue-700">
                            <strong>Saia:</strong> {item.apronLength}m (Alt: {item.apronHeight}m)
                          </div>
                        ) : null}
                        {/* Holes/cutouts */}
                        {(item.undermountSinkCutouts > 0 || item.cooktopCutouts > 0 || item.tapHoles > 0) && (
                          <div className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-max">
                            {item.undermountSinkCutouts > 0 && `Cuba: ${item.undermountSinkCutouts}x `}
                            {item.cooktopCutouts > 0 && `Cooktop: ${item.cooktopCutouts}x `}
                            {item.tapHoles > 0 && `Torneira: ${item.tapHoles}x`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 font-mono">
                        R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="p-1 px-2 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 rounded transition flex items-center gap-1"
                            title="Editar medida"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 px-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded transition flex items-center gap-1"
                            title="Excluir peça"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 p-3 text-right text-xs text-slate-500 border-t border-slate-200">
            Total de Peças: <strong className="text-slate-700">{items.reduce((acc, curr) => acc + curr.quantity, 0)}</strong> | Área Total Acumulada: <strong className="text-slate-700">{items.reduce((acc, curr) => acc + (curr.materialAreaSqm * curr.quantity), 0).toFixed(3)} m²</strong>
          </div>
        </div>
      )}
    </div>
  );
};
