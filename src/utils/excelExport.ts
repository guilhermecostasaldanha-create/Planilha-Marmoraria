import * as XLSX from 'xlsx';
import { Budget, Stone, EdgeFinish } from '../types';

export function exportBudgetToExcel(budget: Budget, stones: Stone[], edges: EdgeFinish[]): void {
  // 1. Create a workspace array of arrays (AOA)
  const rows: any[][] = [];

  // Title Row
  rows.push(['Marmoraria Corte Fino']);
  rows.push(['']); // Empty gap

  // Customer & Budget metadata Block
  rows.push(['DADOS DO CLIENTE', '', '', '', 'DADOS DO ORÇAMENTO']);
  rows.push(['Nome:', budget.customer.name || '-', '', '', 'Orçamento Nº:', budget.code]);
  rows.push(['Telefone:', budget.customer.phone || '-', '', '', 'Data de Emissão:', new Date(budget.date).toLocaleDateString('pt-BR')]);
  rows.push(['E-mail:', budget.customer.email || '-', '', '', 'Validade:', new Date(budget.validUntil).toLocaleDateString('pt-BR')]);
  rows.push(['Endereço:', budget.customer.address || '-', '', '', 'Vendedor:', budget.salesperson || '-']);
  rows.push(['Cidade:', budget.customer.city || '-', '', '', '', '']);
  rows.push(['']); // Empty gap

  // Items Header
  rows.push([
    'Ambiente',
    'Pedra / Material',
    'Comprimento (m)',
    'Largura (m)',
    'Área Unit. (m²)',
    'Qtd',
    'Área Total (m²)',
    'Acabamento Borda',
    'Frontão (Rodabanca)',
    'Saia (Avental)',
    'Cortes/Furos Extra',
    'Valor Total (R$)'
  ]);

  // Insert items
  budget.items.forEach((item) => {
    // Determine stone name info
    let stoneName = '';
    if (item.stoneId === 'custom') {
      stoneName = `${item.customStoneName || 'Pedra Customizada'} (R$ ${(item.customStonePrice || 0).toFixed(2)}/m²)`;
    } else {
      const s = stones.find(stone => stone.id === item.stoneId);
      stoneName = s ? `${s.name} (${s.type})` : 'Não identificada';
    }

    // Find edge finish name
    const edge = edges.find(ed => ed.id === item.edgeFinishId);
    const edgeFinishStr = edge 
      ? `${edge.name} (${item.edgeFinishLength || 0}m)` 
      : 'Nenhum';

    // Backsplash (Rodabanca) summary
    const backsplashStr = item.backsplashLength && item.backsplashLength > 0
      ? `Comp: ${item.backsplashLength}m (Alt: ${item.backsplashHeight || 0.10}m)`
      : 'Não';

    // Apron (Saia) summary
    const apronStr = item.apronLength && item.apronLength > 0
      ? `Comp: ${item.apronLength}m (Alt: ${item.apronHeight || 0.04}m)`
      : 'Não';

    // Extra cutouts summary
    const extraParts: string[] = [];
    if (item.undermountSinkCutouts > 0) extraParts.push(`${item.undermountSinkCutouts}x Cuba`);
    if (item.cooktopCutouts > 0) extraParts.push(`${item.cooktopCutouts}x Cooktop`);
    if (item.tapHoles > 0) extraParts.push(`${item.tapHoles}x Furos`);
    const extrasStr = extraParts.length > 0 ? extraParts.join(' | ') : 'Nenhum';

    const totalArea = item.length * item.width * item.quantity;

    rows.push([
      item.environment || 'Geral',
      stoneName,
      item.length,
      item.width,
      item.length * item.width,
      item.quantity,
      totalArea,
      edgeFinishStr,
      backsplashStr,
      apronStr,
      extrasStr,
      item.totalPrice
    ]);
  });

  rows.push(['']); // Gap

  // Financial summary block
  rows.push(['RESUMO FINANCEIRO']);
  rows.push(['Subtotal dos Itens (Pedras & Cortes):', '', '', '', '', '', '', '', '', '', '', budget.subtotal]);
  
  if (budget.installationPrice > 0) {
    rows.push(['Serviço de Instalação e Assentamento:', '', '', '', '', '', '', '', '', '', '', budget.installationPrice]);
  }
  if (budget.freightPrice > 0) {
    rows.push(['Serviço de Frete e Entrega:', '', '', '', '', '', '', '', '', '', '', budget.freightPrice]);
  }

  // Other extra services
  budget.otherServices.forEach((serv) => {
    rows.push([`Serviço Extra: ${serv.name}:`, '', '', '', '', '', '', '', '', '', '', serv.price]);
  });

  if (budget.discountPercent > 0 || budget.discountAmount > 0) {
    const discountVal = budget.discountAmount > 0 
      ? budget.discountAmount 
      : (budget.subtotal * (budget.discountPercent / 100));
    rows.push([`Desconto Aplicado (${budget.discountPercent}%):`, '', '', '', '', '', '', '', '', '', '', -discountVal]);
  }

  if (budget.taxPercent > 0) {
    const taxVal = budget.subtotal * (budget.taxPercent / 100);
    rows.push([`Encargos/Taxas adicionais (${budget.taxPercent}%):`, '', '', '', '', '', '', '', '', '', '', taxVal]);
  }

  // Grand Total Row
  rows.push(['VALOR TOTAL DO CLIENTE:', '', '', '', '', '', '', '', '', '', '', budget.total]);

  rows.push(['']); // Gap
  
  if (budget.generalNotes) {
    rows.push(['OBSERVAÇÕES DO ORÇAMENTO']);
    rows.push([budget.generalNotes]);
  } else {
    rows.push(['OBSERVAÇÕES PADRÃO']);
    rows.push(['1. Prazo de entrega padrão: 15 a 20 dias úteis após medição fina no local.']);
    rows.push(['2. Cuba de pia, torneiras, cooktop e forno devem estar no local para encaixe exato no dia da instalação.']);
    rows.push(['3. Validade deste orçamento é de 10 dias corridos a partir desta data.']);
  }

  // Create worksheets and write file
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Set beautiful column widths
  worksheet['!cols'] = [
    { wch: 18 }, // Ambiente
    { wch: 35 }, // Pedra
    { wch: 18 }, // Comp
    { wch: 14 }, // Larg
    { wch: 16 }, // Area Unit
    { wch: 8 },  // Qtd
    { wch: 16 }, // Area Total
    { wch: 25 }, // Borda
    { wch: 25 }, // Frontão
    { wch: 25 }, // Saia
    { wch: 20 }, // Cortes
    { wch: 18 }, // Preço Total
  ];

  // Merge headers for visual prettiness
  const merges = [
    // MERGE "ORÇAMENTO DE MARMORARIA" title across columns A to L
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    // MERGE "DADOS DO CLIENTE" title across columns A to D
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    // MERGE "DADOS DO ORÇAMENTO" title across columns E to G
    { s: { r: 2, c: 4 }, e: { r: 2, c: 6 } },
    // Merge cell headers for readability
    { s: { r: 3, c: 1 }, e: { r: 3, c: 3 } },
    { s: { r: 4, c: 1 }, e: { r: 4, c: 3 } },
    { s: { r: 5, c: 1 }, e: { r: 5, c: 3 } },
    { s: { r: 6, c: 1 }, e: { r: 6, c: 3 } },
    { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } },
  ];
  worksheet['!merges'] = merges;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orçamento');

  // Trigger file download
  const dateStr = new Date(budget.date).toISOString().split('T')[0];
  const filename = `Orcamento_${budget.code}_${budget.customer.name.replace(/\s+/g, '_') || 'Cliente'}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
