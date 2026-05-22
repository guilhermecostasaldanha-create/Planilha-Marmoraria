export interface Stone {
  id: string;
  name: string;
  type: 'Granito' | 'Mármore' | 'Quartzo' | 'Industrial' | 'Outro';
  pricePerSqm: number; // Price per m²
  description?: string;
}

export interface EdgeFinish {
  id: string;
  name: string;
  pricePerMeter: number; // Price per linear meter
}

export interface ExtraService {
  id: string;
  name: string;
  price: number;
}

export interface BudgetItem {
  id: string;
  environment: string; // e.g. "Cozinha", "Suíte"
  stoneId: string;
  customStoneName?: string;
  customStonePrice?: number;
  
  // Dimensions
  length: number; // in meters
  width: number; // in meters
  quantity: number;
  
  // Backsplash / Frontão (Rodabanca)
  backsplashLength?: number; // in meters
  backsplashHeight?: number; // in meters (default 0.10m = 10cm)
  
  // Apron / Skirt (Saia)
  apronLength?: number; // in meters
  apronHeight?: number; // in meters (default 0.04m = 4cm)
  
  // Edge finishing
  edgeFinishId: string;
  edgeFinishLength?: number; // in meters (how many meters of finishing)
  
  // Cutouts / Extra details
  undermountSinkCutouts: number; // Hole for sink
  cooktopCutouts: number; // Cooktop hole
  tapHoles: number; // Tap hole
  
  // Manual adjustments / observations
  observation?: string;
  
  // Calculated Subtotals
  materialAreaSqm: number;
  materialPrice: number;
  backsplashPrice: number;
  apronPrice: number;
  edgeFinishPrice: number;
  cutoutsPrice: number;
  totalPrice: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

export interface Budget {
  id: string;
  code: string; // e.g. "ORC-2026-001"
  date: string;
  validUntil: string;
  salesperson: string;
  customer: CustomerInfo;
  items: BudgetItem[];
  
  // Services
  installationPrice: number;
  freightPrice: number;
  otherServices: ExtraService[];
  
  // Margins / Adjustments
  discountPercent: number; // e.g. 5 for 5%
  discountAmount: number;
  taxPercent: number;
  
  // Observações gerais
  generalNotes?: string;
  
  // Totals
  subtotal: number;
  total: number;
}
