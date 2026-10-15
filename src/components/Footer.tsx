import React from 'react';
import { Car, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="text-blue-400" size={32} />
              <div>
                <h3 className="text-xl font-bold">AutoCenter</h3>
                <p className="text-sm text-slate-400">Sua concessionária de confiança</p>
              </div>
            </div>
            <p className="text-slate-400 mb-4">
              Há mais de 10 anos oferecendo os melhores veículos com 
              financiamento facilitado e atendimento personalizado.
            </p>
            <div className="flex space-x-3">
              <Facebook className="text-slate-400 hover:text-white cursor-pointer" size={20} />
              <Instagram className="text-slate-400 hover:text-white cursor-pointer" size={20} />
              <Youtube className="text-slate-400 hover:text-white cursor-pointer" size={20} />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3 text-slate-400">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>(11) 3456-7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>contato@autocenter.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Av. Paulista, 1000 - São Paulo, SP</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Horário de Funcionamento</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <div>
                  <p>Segunda a Sexta: 8h às 18h</p>
                  <p>Sábado: 8h às 16h</p>
                  <p>Domingo: Fechado</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2 text-slate-400">
              <li>• Venda de veículos novos e seminovos</li>
              <li>• Financiamento facilitado</li>
              <li>• Avaliação de veículos</li>
              <li>• Test drive agendado</li>
              <li>• Documentação completa</li>
              <li>• Garantia e pós-venda</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 AutoCenter. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">
            CNPJ: 12.345.678/0001-90 | Política de Privacidade | Termos de Uso
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;