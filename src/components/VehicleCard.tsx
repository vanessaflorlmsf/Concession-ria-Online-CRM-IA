import React from 'react';
import { Vehicle } from '../types';
import { Fuel, Settings, Calendar, MapPin, Star } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewDetails: (vehicle: Vehicle) => void;
  onSimulateFinancing: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onViewDetails, onSimulateFinancing }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          {vehicle.isNew ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              0KM
            </span>
          ) : (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              SEMINOVO
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <Star className="text-yellow-500" size={16} />
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {formatPrice(vehicle.price)}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-slate-600">
            <Calendar size={16} />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <MapPin size={16} />
            <span>{vehicle.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Fuel size={16} />
            <span>{vehicle.fuel}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Settings size={16} />
            <span>{vehicle.transmission}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {vehicle.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
              >
                {feature}
              </span>
            ))}
            {vehicle.features.length > 2 && (
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                +{vehicle.features.length - 2} itens
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(vehicle)}
            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            Ver Detalhes
          </button>
          <button
            onClick={() => onSimulateFinancing(vehicle)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Financiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;