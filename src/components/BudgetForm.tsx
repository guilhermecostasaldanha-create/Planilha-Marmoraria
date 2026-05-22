import React from 'react';
import { CustomerInfo, Budget } from '../types';
import { User, Image, Phone, Mail, MapPin, Calendar, ClipboardList } from 'lucide-react';

interface BudgetFormProps {
  customer: CustomerInfo;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  budgetMeta: {
    code: string;
    date: string;
    validUntil: string;
    salesperson: string;
    generalNotes: string;
  };
  setBudgetMeta: React.Dispatch<React.SetStateAction<{
    code: string;
    date: string;
    validUntil: string;
    salesperson: string;
    generalNotes: string;
  }>>;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  customer,
  setCustomer,
  budgetMeta,
  setBudgetMeta,
}) => {
  const handleCustomerChange = (key: keyof CustomerInfo, value: string) => {
    setCustomer(prev => ({ ...prev, [key]: value }));
  };

  const handleMetaChange = (key: string, value: string) => {
    setBudgetMeta(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50/60 p-6 rounded-xl border border-slate-200 print:bg-white print:border-none print:p-0">
      {/* Dados do Cliente */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Identificação do Cliente
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome completo / Razão Social</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <User className="h-4 h-4" />
              </span>
              <input
                id="customer-name-input"
                type="text"
                placeholder="Ex: João da Silva ou Construtora XYZ"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                value={customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Telefone / WhatsApp</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Phone className="h-4 h-4" />
              </span>
              <input
                id="customer-phone-input"
                type="text"
                placeholder="Ex: (11) 98765-4321"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                value={customer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Mail className="h-4 h-4" />
              </span>
              <input
                id="customer-email-input"
                type="email"
                placeholder="Ex: joao@email.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                value={customer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cidade / Estado</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <MapPin className="h-4 h-4" />
              </span>
              <input
                id="customer-city-input"
                type="text"
                placeholder="Ex: São Paulo - SP"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                value={customer.city}
                onChange={(e) => handleCustomerChange('city', e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Endereço de Entrega / Instalação</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <MapPin className="h-4 h-4" />
              </span>
              <input
                id="customer-address-input"
                type="text"
                placeholder="Ex: Av. Paulista, 1000 - Apto 42"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                value={customer.address}
                onChange={(e) => handleCustomerChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metadados do Orçamento */}
      <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-600" />
          Faturamento e Gestão
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Código do Orçamento</label>
            <input
              id="budget-code-input"
              type="text"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              value={budgetMeta.code}
              onChange={(e) => handleMetaChange('code', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de Emissão</label>
              <input
                id="budget-date-input"
                type="date"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                value={budgetMeta.date}
                onChange={(e) => handleMetaChange('date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de Validade</label>
              <input
                id="budget-valid-input"
                type="date"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                value={budgetMeta.validUntil}
                onChange={(e) => handleMetaChange('validUntil', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Consultor / Vendedor</label>
            <input
              id="budget-salesperson-input"
              type="text"
              placeholder="Nome do consultor da marmoraria"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              value={budgetMeta.salesperson}
              onChange={(e) => handleMetaChange('salesperson', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
