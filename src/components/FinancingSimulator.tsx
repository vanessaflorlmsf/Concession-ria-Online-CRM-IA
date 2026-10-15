import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Calendar, DollarSign, MessageCircle, TrendingUp, X } from 'lucide-react';
import type { Vehicle } from '../types';
import { financingOptions } from '../data/banks';
import { formatBRL, vehicleTitle, whatsappLink } from '../lib-whatsapp';

interface FinancingSimulatorProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

const ALL_TERMS = [12, 24, 36, 48, 60];
const MAX_DOWN_PERCENT = 70;

/** Parcela pela Tabela Price. Com taxa zero, divide o saldo igualmente. */
function monthlyPaymentFor(loan: number, ratePercent: number, terms: number) {
  if (loan <= 0) return 0;
  const i = ratePercent / 100;
  if (i === 0) return loan / terms;
  const f = Math.pow(1 + i, terms);
  return (loan * i * f) / (f - 1);
}

const Inner: React.FC<{ vehicle: Vehicle; onClose: () => void; whatsappNumber?: string }> = ({ vehicle, onClose, whatsappNumber }) => {
  const [bankId, setBankId] = useState(financingOptions[0].id);
  const bank = financingOptions.find(b => b.id === bankId) ?? financingOptions[0];

  const minDown = Math.ceil((vehicle.price * bank.minDownPayment) / 100);
  const maxDown = Math.floor((vehicle.price * MAX_DOWN_PERCENT) / 100);
  const termOptions = ALL_TERMS.filter(t => t <= bank.maxTerms);

  const [downPayment, setDownPayment] = useState(() => Math.max(minDown, Math.round(vehicle.price * 0.2)));
  const [terms, setTerms] = useState(48);

  // Ao trocar de banco, respeita a entrada mínima e o prazo máximo daquela financeira.
  useEffect(() => {
    setDownPayment(d => Math.min(Math.max(d, minDown), maxDown));
    setTerms(t => (t > bank.maxTerms ? bank.maxTerms : t));
  }, [minDown, maxDown, bank.maxTerms]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const result = useMemo(() => {
    const loan = Math.max(vehicle.price - downPayment, 0);
    const monthly = monthlyPaymentFor(loan, bank.interestRate, terms);
    return { loan, monthly, total: monthly * terms + downPayment };
  }, [vehicle.price, downPayment, terms, bank.interestRate]);

  const message =
    `Olá! Fiz uma simulação de financiamento do ${vehicleTitle(vehicle)} (${formatBRL(vehicle.price)}): ` +
    `entrada de ${formatBRL(downPayment)} + ${terms}x de ${formatBRL(result.monthly, 2)} ` +
    `(${bank.bankName}, ${bank.interestRate}% a.m.). Quero seguir com a análise de crédito.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Simulador de financiamento"
        onClick={e => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Calculator className="text-blue-600" size={26} />
            <div>
              <h2 className="text-xl font-black text-slate-800 sm:text-2xl">Simulação de financiamento</h2>
              <p className="text-sm text-slate-600">{vehicleTitle(vehicle)}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X />
          </button>
        </div>

        <div className="grid gap-8 p-5 sm:p-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Valor do veículo</p>
              <p className="text-3xl font-black text-blue-600">{formatBRL(vehicle.price)}</p>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Banco / financeira
              <select
                value={bankId}
                onChange={e => setBankId(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {financingOptions.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} — {b.interestRate}% a.m.
                  </option>
                ))}
              </select>
            </label>

            <div>
              <label htmlFor="down" className="block text-sm font-medium text-slate-700">
                Entrada: <strong>{formatBRL(downPayment)}</strong>{' '}
                <span className="text-slate-500">({Math.round((downPayment / vehicle.price) * 100)}%)</span>
              </label>
              <input
                id="down"
                type="range"
                min={minDown}
                max={maxDown}
                step={500}
                value={Math.min(Math.max(downPayment, minDown), maxDown)}
                onChange={e => setDownPayment(Number(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-blue-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>Mín. {formatBRL(minDown)}</span>
                <span>{formatBRL(maxDown)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">Prazo</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {termOptions.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTerms(t)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                      terms === t ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-800">Resultado da simulação</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-white p-4">
                <DollarSign className="text-green-600" size={22} />
                <div>
                  <p className="text-sm text-slate-600">Valor da parcela</p>
                  <p className="text-3xl font-black text-green-600">{formatBRL(result.monthly, 2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-4">
                  <p className="mb-1 flex items-center gap-2 text-sm text-slate-600"><Calendar className="text-blue-600" size={16} /> Prazo</p>
                  <p className="font-bold text-slate-800">{terms} meses</p>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <p className="mb-1 flex items-center gap-2 text-sm text-slate-600"><TrendingUp className="text-orange-600" size={16} /> Taxa</p>
                  <p className="font-bold text-slate-800">{bank.interestRate}% a.m.</p>
                </div>
              </div>
              <div className="rounded-lg border-l-4 border-blue-600 bg-white p-4">
                <p className="text-sm text-slate-600">Valor financiado: {formatBRL(result.loan)}</p>
                <p className="mt-1 text-sm text-slate-600">Total a pagar</p>
                <p className="text-xl font-bold text-slate-800">{formatBRL(result.total, 2)}</p>
                <p className="text-xs text-slate-500">Entrada + {terms}x de {formatBRL(result.monthly, 2)}</p>
              </div>
              <a
                href={whatsappLink(message, whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700"
              >
                <MessageCircle size={19} /> Enviar simulação pelo WhatsApp
              </a>
              <p className="text-center text-xs text-slate-500">
                * Valores estimados, sem IOF, tarifas ou seguros. Sujeitos à aprovação de crédito e às condições da instituição.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancingSimulator: React.FC<FinancingSimulatorProps> = ({ vehicle, isOpen, onClose, whatsappNumber }) => {
  if (!isOpen || !vehicle) return null;
  return <Inner key={vehicle.id} vehicle={vehicle} onClose={onClose} whatsappNumber={whatsappNumber} />;
};

export default FinancingSimulator;
