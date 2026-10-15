import { FinancingOption } from '../types';

export const financingOptions: FinancingOption[] = [
  {
    id: '1',
    bankName: 'Banco do Brasil',
    interestRate: 1.49,
    maxTerms: 60,
    minDownPayment: 20,
    logo: '🏦'
  },
  {
    id: '2',
    bankName: 'Itaú',
    interestRate: 1.59,
    maxTerms: 48,
    minDownPayment: 15,
    logo: '🏛️'
  },
  {
    id: '3',
    bankName: 'Bradesco',
    interestRate: 1.69,
    maxTerms: 60,
    minDownPayment: 20,
    logo: '🏪'
  },
  {
    id: '4',
    bankName: 'Santander',
    interestRate: 1.55,
    maxTerms: 48,
    minDownPayment: 25,
    logo: '🏢'
  },
  {
    id: '5',
    bankName: 'Caixa Econômica',
    interestRate: 1.45,
    maxTerms: 60,
    minDownPayment: 30,
    logo: '🏦'
  }
];