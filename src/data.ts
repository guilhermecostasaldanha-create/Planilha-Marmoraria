import { Stone, EdgeFinish, BudgetItem } from './types';

export const DEFAULT_STONES: Stone[] = [
  // Granitos - Mais resistentes, ótimos para cozinhas e áreas externas
  { id: 'g1', name: 'Granito Verde Ubatuba', type: 'Granito', pricePerSqm: 380.00, description: 'Verde escuro quase preto, muito resistente e econômico.' },
  { id: 'g2', name: 'Granito Preto São Gabriel', type: 'Granito', pricePerSqm: 550.00, description: 'Preto intenso de granulação média, excelente custo-benefício.' },
  { id: 'g3', name: 'Granito Branco Siena', type: 'Granito', pricePerSqm: 420.00, description: 'Fundo claro com pequenas pontuações cinzas e avermelhadas.' },
  { id: 'g4', name: 'Granito Café Imperial', type: 'Granito', pricePerSqm: 680.00, description: 'Granito marrom escuro sofisticado e extremamente denso.' },
  { id: 'g5', name: 'Granito Cinza Corumbá', type: 'Granito', pricePerSqm: 320.00, description: 'Cinza claro tradicional, ideal para grandes áreas e soleiras.' },
  { id: 'g6', name: 'Granito Preto Absoluto', type: 'Granito', pricePerSqm: 1100.00, description: 'Preto homogêneo de grão finíssimo, luxo e alta resistência.' },
  
  // Mármores - Mais porosos, recomendados para banheiros e painéis internos
  { id: 'm1', name: 'Mármore Travertino Nacional (Bahia)', type: 'Mármore', pricePerSqm: 650.00, description: 'Bege claro com veios horizontais marcantes. Clássico.' },
  { id: 'm2', name: 'Mármore Branco Carrara (Importado)', type: 'Mármore', pricePerSqm: 1800.00, description: 'Clássico italiano branco puríssimo com veios cinzas.' },
  { id: 'm3', name: 'Mármore Crema Marfil', type: 'Mármore', pricePerSqm: 1200.00, description: 'Espanhol, tom bege amanteigado homogêneo e sofisticado.' },
  { id: 'm4', name: 'Mármore Nero Marquina', type: 'Mármore', pricePerSqm: 1400.00, description: 'Espanhol, fundo preto escuro com veios brancos marcantes.' },
  { id: 'm5', name: 'Mármore Branco Paraná', type: 'Mármore', pricePerSqm: 950.00, description: 'Mármore nacional nobre com veios dourados e cinzas.' },

  // Superfícies Sintéticas e Quartzos - Higiênicos, modernos, cor uniforme
  { id: 'q1', name: 'Quartzo Branco Prime', type: 'Quartzo', pricePerSqm: 620.00, description: 'Sintético composto, branco homogêneo, ideal para lavatórios.' },
  { id: 'q2', name: 'Quartzo Pure White', type: 'Quartzo', pricePerSqm: 1150.00, description: 'Quartzo branco puro de altíssima resistência a manchas.' },
  { id: 'q3', name: 'Quartzo Cinza Stellar', type: 'Quartzo', pricePerSqm: 1250.00, description: 'Superfície cinza com pequenos pontos de brilho espelhado.' },
  { id: 'q4', name: 'Quartzo Calacatta', type: 'Quartzo', pricePerSqm: 1900.00, description: 'Fundo branco puro com imitação perfeita de veios de mármore.' },
  { id: 'q5', name: 'Sinterizado / Ultracompacto Lamina', type: 'Industrial', pricePerSqm: 2400.00, description: 'Altíssima tecnologia, suporta calor direto e riscos. Área Gourmet.' },
  
  // Customizado
  { id: 'custom', name: 'Pedra Customizada (Informar valor)', type: 'Outro', pricePerSqm: 0.00, description: 'Defina o nome da rocha e o preço personalizado por m².' }
];

export const DEFAULT_EDGES: EdgeFinish[] = [
  { id: 'e1', name: 'Reto Polido / Simples', pricePerMeter: 35.00 },
  { id: 'e2', name: 'Meia Esquadria (45 graus)', pricePerMeter: 120.00 },
  { id: 'e3', name: 'Bisotado 45°', pricePerMeter: 50.00 },
  { id: 'e4', name: 'Boleado Simples (Redondo)', pricePerMeter: 45.00 },
  { id: 'e5', name: 'Boleado Duplo', pricePerMeter: 70.00 },
  { id: 'e6', name: 'Peito de Pombo (Ogee)', pricePerMeter: 90.00 },
];

export const STANDARD_COSTS = {
  undermountSinkCutout: 150.00, // Furo de cuba de embutir polido
  cooktopCutout: 100.00,       // Furo de cooktop desbastado
  tapHole: 40.00,              // Furo de torneira
};

// Helper function to calculate a budget item subtotals based on variables
export function calculateItemTotal(item: Partial<BudgetItem>, stones: Stone[] = DEFAULT_STONES, edges: EdgeFinish[] = DEFAULT_EDGES): BudgetItem {
  const finalItem = {
    id: item.id || Math.random().toString(36).substring(2, 9),
    environment: item.environment || 'Cozinha',
    stoneId: item.stoneId || stones[0].id,
    customStoneName: item.customStoneName || '',
    customStonePrice: item.customStonePrice || 0,
    
    length: Number(item.length) || 0,
    width: Number(item.width) || 0,
    quantity: Number(item.quantity) || 1,
    
    backsplashLength: Number(item.backsplashLength) || 0,
    backsplashHeight: Number(item.backsplashHeight) || 0.10, // 10cm default
    
    apronLength: Number(item.apronLength) || 0,
    apronHeight: Number(item.apronHeight) || 0.04, // 4cm default
    
    edgeFinishId: item.edgeFinishId || edges[0].id,
    edgeFinishLength: item.edgeFinishLength !== undefined ? Number(item.edgeFinishLength) : (Number(item.length) || 0),
    
    undermountSinkCutouts: Number(item.undermountSinkCutouts) || 0,
    cooktopCutouts: Number(item.cooktopCutouts) || 0,
    tapHoles: Number(item.tapHoles) || 0,
    
    observation: item.observation || '',
    
    // Will be calculated below
    materialAreaSqm: 0,
    materialPrice: 0,
    backsplashPrice: 0,
    apronPrice: 0,
    edgeFinishPrice: 0,
    cutoutsPrice: 0,
    totalPrice: 0
  };

  // Find Stone price
  const stone = stones.find(s => s.id === finalItem.stoneId);
  const pricePerSqm = (stone && stone.id !== 'custom') ? stone.pricePerSqm : finalItem.customStonePrice;
  
  // Calculate raw stone area & price
  // Area = length * width
  finalItem.materialAreaSqm = finalItem.length * finalItem.width;
  finalItem.materialPrice = finalItem.materialAreaSqm * pricePerSqm;
  
  // Backsplash price (calculated by its area length * height * stone sqm price)
  // Usually backsplashes represent extra stone.
  const backsplashAreaSqm = finalItem.backsplashLength * finalItem.backsplashHeight;
  // Cost = (Area of backsplash * stone cost) + basic cutting fee of R$ 20 per meter
  finalItem.backsplashPrice = backsplashAreaSqm > 0 ? (backsplashAreaSqm * pricePerSqm) + (finalItem.backsplashLength * 20) : 0;
  
  // Apron/Skirt (Saia) price
  // Area of apron = length * height. Cost = (Area * stone cost) + joint gluing labor (e.g. 30 per meter)
  const apronAreaSqm = finalItem.apronLength * finalItem.apronHeight;
  finalItem.apronPrice = apronAreaSqm > 0 ? (apronAreaSqm * pricePerSqm) + (finalItem.apronLength * 30) : 0;
  
  // Find Edge finish price
  const edge = edges.find(e => e.id === finalItem.edgeFinishId);
  const edgeRate = edge ? edge.pricePerMeter : 0;
  finalItem.edgeFinishPrice = finalItem.edgeFinishLength * edgeRate;
  
  // Calculate Cutouts
  finalItem.cutoutsPrice = 
    (finalItem.undermountSinkCutouts * STANDARD_COSTS.undermountSinkCutout) +
    (finalItem.cooktopCutouts * STANDARD_COSTS.cooktopCutout) +
    (finalItem.tapHoles * STANDARD_COSTS.tapHole);
    
  // Sum item subtotal
  const baseSubtotal = 
    finalItem.materialPrice + 
    finalItem.backsplashPrice + 
    finalItem.apronPrice + 
    finalItem.edgeFinishPrice + 
    finalItem.cutoutsPrice;
    
  // Apply Quantity
  finalItem.totalPrice = baseSubtotal * finalItem.quantity;
  
  return finalItem;
}

// Generates a nice default budget code based on current year and sequence
export function generateBudgetCode(): string {
  const year = new Date().getFullYear();
  const randNum = Math.floor(100 + Math.random() * 900);
  return `ORC-${year}-${randNum}`;
}
