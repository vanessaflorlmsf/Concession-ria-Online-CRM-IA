import type { Vehicle } from './types';

export const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');

export const formatBRL = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value || 0);

/** Monta o link wa.me. Sem número configurado, abre o WhatsApp para o cliente escolher o contato. */
export function whatsappLink(text: string, number: string = whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export const vehicleTitle = (v: Pick<Vehicle, 'brand' | 'model' | 'year'>) => `${v.brand} ${v.model} ${v.year}`;

export const negotiateMessage = (v: Vehicle) =>
  `Olá! Quero negociar o ${vehicleTitle(v)} anunciado por ${formatBRL(v.price)}. Ainda está disponível?`;
