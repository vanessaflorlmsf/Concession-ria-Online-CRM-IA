export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  color: string;
  image: string;
  features: string[];
  description: string;
  isNew: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  monthlyIncome: number;
  createdAt: string;
}

export interface FinancingOption {
  id: string;
  bankName: string;
  interestRate: number;
  maxTerms: number;
  minDownPayment: number;
  logo: string;
}

export interface FinancingSimulation {
  vehiclePrice: number;
  downPayment: number;
  terms: number;
  interestRate: number;
  monthlyPayment: number;
  totalAmount: number;
  bankName: string;
}