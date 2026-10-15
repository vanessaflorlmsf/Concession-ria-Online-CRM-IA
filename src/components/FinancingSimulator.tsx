import React, { useState, useEffect } from 'react';
import { Vehicle, FinancingOption, FinancingSimulation } from '../types';
import { financingOptions } from '../data/banks';
import { Calculator, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface FinancingSimulatorProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

const FinancingSimulator: React.FC<FinancingSimulatorProps> = ({ vehicle, isOpen, onClose }) => {
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [downPayment, setDownPayment] = useState<number>(0);
  const [terms, setTerms] = useState<number>(24);
  const [simulation, setSimulation] = useState<FinancingSimulation | null>(null);

  useEffect(() => {
    if (vehicle && financingOptions.length > 0) {
      setSelectedBank(financingOptions[0].id);
      setDownPayment(Math.floor(vehicle.price * 0.2));
    }
  }, [vehicle]);

  const calculateFinancing = () => {
    if (!vehicle || !selectedBank) return;

    const bank = financingOptions.find(b => b.id === selectedBank);
    if (!bank) return;

    const loanAmount = vehicle.price - downPayment;
    const monthlyRate = bank.interestRate / 100;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, terms)) / 
                          (Math.pow(1 + monthlyRate, terms) - 1);
    const totalAmount = (monthlyPayment * terms) + downPayment;

    setSimulation({
      vehiclePrice: vehicle.price,
      downPayment,
      terms,
      interestRate: bank.interestRate,
      monthlyPayment,
      totalAmount,
      bankName: bank.bankName
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Calculator className="text-blue-600" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Simulador de Financiamento</h2>
                <p className="text-slate-600">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-2">Veículo Selecionado</h3>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(vehicle.price)}</p>
                <p className="text-slate-600">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Banco/Financeira
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {financingOptions.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.logo} {bank.bankName} - {bank.interestRate}% a.m.
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Entrada: {formatCurrency(downPayment)}
                </label>
                <input
                  type="range"
                  min={vehicle.price * 0.1}
                  max={vehicle.price * 0.5}
                  step={1000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{formatCurrency(vehicle.price * 0.1)}</span>
                  <span>{formatCurrency(vehicle.price * 0.5)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parcelas: {terms} meses
                </label>
                <input
                  type="range"
                  min={12}
                  max={60}
                  step={6}
                  value={terms}
                  onChange={(e) => setTerms(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>12 meses</span>
                  <span>60 meses</span>
                </div>
              </div>

              <button
                onClick={calculateFinancing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Calculator size={20} />
                <span>Simular Financiamento</span>
              </button>
            </div>

            {simulation && (
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Resultado da Simulação</h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-slate-600">Valor das Parcelas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(simulation.monthlyPayment)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="text-blue-600" size={16} />
                        <p className="text-sm text-slate-600">Prazo</p>
                      </div>
                      <p className="font-bold text-slate-800">{simulation.terms} meses</p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="text-orange-600" size={16} />
                        <p className="text-sm text-slate-600">Taxa</p>
                      </div>
                      <p className="font-bold text-slate-800">{simulation.interestRate}% a.m.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                    <p className="text-sm text-slate-600 mb-1">Valor Total</p>
                    <p className="text-xl font-bold text-slate-800">
                      {formatCurrency(simulation.totalAmount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Entrada + {simulation.terms}x de {formatCurrency(simulation.monthlyPayment)}
                    </p>
                  </div>

                  <div className="text-center pt-4">
                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Solicitar Aprovação
                    </button>
                    <p className="text-xs text-slate-500 mt-2">
                      * Simulação sujeita à aprovação de crédito
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancingSimulator;