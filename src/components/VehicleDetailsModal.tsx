import React, { useEffect, useState } from 'react';
import { Calculator, Calendar, CheckCircle2, Fuel, Gauge, MessageCircle, Palette, Settings, X } from 'lucide-react';
import type { Vehicle } from '../types';
import { formatBRL, negotiateMessage, vehicleTitle, whatsappLink } from '../lib-whatsapp';

interface Props {
  vehicle: (Vehicle & { gallery?: string[] }) | null;
  onClose: () => void;
  onSimulate: (vehicle: Vehicle) => void;
  whatsappNumber?: string;
}

const FALLBACK = 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200';

const Inner: React.FC<Required<Pick<Props, 'onClose' | 'onSimulate'>> & { vehicle: NonNullable<Props['vehicle']>; whatsappNumber?: string }> = ({
  vehicle, onClose, onSimulate, whatsappNumber,
}) => {
  const images = [vehicle.image, ...(Array.isArray(vehicle.gallery) ? vehicle.gallery : [])]
    .filter((s): s is string => typeof s === 'string' && /^https:\/\//i.test(s));
  const photos = images.length ? Array.from(new Set(images)) : [FALLBACK];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const specs = [
    { icon: Calendar, label: 'Ano', value: String(vehicle.year) },
    { icon: Gauge, label: 'Quilometragem', value: `${(vehicle.mileage || 0).toLocaleString('pt-BR')} km` },
    { icon: Fuel, label: 'Combustível', value: vehicle.fuel },
    { icon: Settings, label: 'Câmbio', value: vehicle.transmission },
    { icon: Palette, label: 'Cor', value: vehicle.color },
  ].filter(s => s.value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes do ${vehicleTitle(vehicle)}`}
        onClick={e => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="grid md:grid-cols-2">
          <div className="bg-slate-100 p-3">
            <img src={photos[active]} alt={vehicleTitle(vehicle)} className="h-64 w-full rounded-xl object-cover sm:h-80" />
            {photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {photos.map((p, i) => (
                  <button key={p} onClick={() => setActive(i)} aria-label={`Foto ${i + 1}`}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-blue-600' : 'border-transparent'}`}>
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{vehicle.isNew ? '0 KM' : 'Seminovo'}</span>
                <h2 className="mt-2 text-2xl font-black text-slate-900">{vehicle.brand} {vehicle.model}</h2>
                <p className="mt-1 text-3xl font-black text-blue-600">{formatBRL(vehicle.price)}</p>
              </div>
              <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X /></button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {specs.map(s => (
                <div key={s.label} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                  <s.icon size={17} className="shrink-0 text-blue-600" />
                  <div><dt className="text-xs text-slate-500">{s.label}</dt><dd className="font-semibold text-slate-800">{s.value}</dd></div>
                </div>
              ))}
            </dl>

            {vehicle.description && <p className="mt-5 text-sm leading-relaxed text-slate-600">{vehicle.description}</p>}

            {vehicle.features?.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-bold text-slate-800">Itens e opcionais</h3>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {vehicle.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={15} className="shrink-0 text-green-600" />{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => onSimulate(vehicle)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">
                <Calculator size={17} /> Simular financiamento
              </button>
              <a href={whatsappLink(negotiateMessage(vehicle), whatsappNumber)} target="_blank" rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700">
                <MessageCircle size={17} /> Negocie pelo WhatsApp
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-500">Confirme disponibilidade e condições com nossa equipe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VehicleDetailsModal: React.FC<Props> = ({ vehicle, ...rest }) =>
  vehicle ? <Inner key={vehicle.id} vehicle={vehicle} {...rest} /> : null;

export default VehicleDetailsModal;
