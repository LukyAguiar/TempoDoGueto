"use client";

import { CheckCircle, MessageCircle, Phone, Calendar, Clock, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { BookingConfirmation } from "@/server/actions/appointment";
import { formatDateDisplay } from "@/lib/dates";

type Props = {
  confirmation: BookingConfirmation;
  onNewBooking: () => void;
};

/**
 * Gera link wa.me com mensagem pré-preenchida.
 * Remove tudo que não é dígito do telefone.
 */
function buildWhatsAppLink(confirmation: BookingConfirmation): string | null {
  if (!confirmation.businessPhone) return null;

  const digits = confirmation.businessPhone.replace(/\D/g, "");
  // Adiciona código do Brasil se não tiver DDI
  const phone = digits.startsWith("55") ? digits : `55${digits}`;

  const message = encodeURIComponent(
    `Olá! Acabei de agendar um(a) *${confirmation.serviceName}* para o dia *${formatDateDisplay(confirmation.date)}* às *${confirmation.startTime}*. Meu nome é *${confirmation.customerName}*. Pode confirmar meu agendamento?`
  );

  return `https://wa.me/${phone}?text=${message}`;
}

export function BookingSuccess({ confirmation, onNewBooking }: Props) {
  const whatsappLink = buildWhatsAppLink(confirmation);

  return (
    <div className="space-y-4">
      {/* Card principal de sucesso */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header verde */}
        <div className="bg-green-500 px-6 py-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">
            Agendamento realizado!
          </h2>
          <p className="text-green-100 text-sm mt-1">
            Seu horário está reservado
          </p>
        </div>

        {/* Detalhes do agendamento */}
        <div className="px-6 py-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Detalhes do agendamento
          </h3>

          <div className="space-y-3">
            {/* Cliente */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-slate-500 text-sm font-bold">
                  {confirmation.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cliente</p>
                <p className="text-sm font-medium text-slate-900">
                  {confirmation.customerName}
                </p>
              </div>
            </div>

            {/* Serviço */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Serviço</p>
                <p className="text-sm font-medium text-slate-900">
                  {confirmation.serviceName}
                </p>
              </div>
            </div>

            {/* Data */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Data e horário</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDateDisplay(confirmation.date)} às {confirmation.startTime}
                  <span className="text-slate-400 font-normal">
                    {" "}(até {confirmation.endTime})
                  </span>
                </p>
              </div>
            </div>

            {/* Negócio */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Estabelecimento</p>
                <p className="text-sm font-medium text-slate-900">
                  {confirmation.businessName}
                </p>
              </div>
            </div>

            {/* Telefone do salão */}
            {confirmation.businessPhone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Contato do salão</p>
                  <p className="text-sm font-medium text-slate-900">
                    {confirmation.businessPhone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botão WhatsApp */}
        {whatsappLink && (
          <div className="px-6 pb-5">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <MessageCircle size={18} />
              Confirmar pelo WhatsApp
            </a>
            <p className="text-center text-xs text-slate-400 mt-2">
              Envie uma mensagem para confirmar com o salão
            </p>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <h3 className="text-sm font-semibold text-amber-900 mb-2">
          📋 Lembre-se
        </h3>
        <ul className="space-y-1.5 text-sm text-amber-800">
          <li>• Chegue com alguns minutos de antecedência</li>
          <li>• Em caso de imprevisto, avise pelo WhatsApp</li>
          <li>• Guarde o horário: {confirmation.startTime} do dia {formatDateDisplay(confirmation.date)}</li>
        </ul>
      </div>

      {/* Link para acompanhar status */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-center">
        <p className="text-xs text-slate-500 mb-2">
          Acompanhe o status do seu agendamento:
        </p>
        <Link
          href={`/booking/${confirmation.appointmentId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
        >
          <ExternalLink size={14} />
          Ver status do agendamento
        </Link>
        <p className="text-xs text-slate-400 mt-1.5">
          Salve este link para acompanhar a confirmação
        </p>
      </div>

      {/* Ação secundária */}
      <div className="text-center pb-2">
        <button
          onClick={onNewBooking}
          className="text-sm text-slate-500 hover:text-brand-600 hover:underline transition-colors"
        >
          Fazer outro agendamento
        </button>
      </div>
    </div>
  );
}
