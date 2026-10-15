import React from 'react';
import { Search, Star, Shield, Award } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Encontre o
              <span className="text-yellow-400"> carro perfeito</span>
              <br />para você
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Mais de 10 anos no mercado, oferecendo os melhores veículos
              com financiamento facilitado e atendimento personalizado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-yellow-400 text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Search size={20} />
                <span>Ver Estoque</span>
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-slate-800 transition-all">
                Simular Financiamento
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2">
                  <Star className="text-white" size={24} />
                </div>
                <p className="font-semibold">500+</p>
                <p className="text-sm text-blue-200">Carros Vendidos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mx-auto mb-2">
                  <Shield className="text-white" size={24} />
                </div>
                <p className="font-semibold">10 Anos</p>
                <p className="text-sm text-blue-200">No Mercado</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2">
                  <Award className="text-white" size={24} />
                </div>
                <p className="font-semibold">98%</p>
                <p className="text-sm text-blue-200">Satisfação</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-white/10 to-transparent rounded-2xl p-8 backdrop-blur-sm border border-white/20">
              <img
                src="https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Carro em destaque"
                className="w-full rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-slate-800 px-4 py-2 rounded-lg font-bold shadow-lg">
                0km Disponível
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;