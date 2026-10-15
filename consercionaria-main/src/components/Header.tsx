import React from 'react';
import { Car, Phone, Mail, MapPin } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="bg-slate-800 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone size={14} />
                <span>(11) 3456-7890</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail size={14} />
                <span>contato@autocenter.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin size={14} />
              <span>Av. Paulista, 1000 - São Paulo, SP</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">AutoCenter</h1>
              <p className="text-sm text-slate-500">Sua concessionária de confiança</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#home" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Início
            </a>
            <a href="#vehicles" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Veículos
            </a>
            <a href="#financing" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Financiamento
            </a>
            <a href="#contact" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Contato
            </a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Cadastrar-se
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;