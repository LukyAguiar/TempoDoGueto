"use client";

import {
  Clock,
  CheckCircle,
  XCircle,
  CheckCheck,
  Calendar,
  Scissors,
  MessageCircle,
  Phone,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { AppointmentStatus } from "@prisma/client";
import { formatDateDisplay } from "@/lib/dates";

type AppointmentData = {
  id: string;
  status: AppointmentStatus;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  businessName: string;
  businessPhone: string | null;
  businessSlug: string;
};

type StatusConfig = {
  icon: React.ReactNode;
  headerBg: string;
  headerText: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
};

function getStatusConfig(status: AppointmentStatus): StatusConfig {
  switch (status) {
    case "PENDING":
      return {
        icon: <Clock size={40} className="text-white" />,
        headerBg: "bg-amber-400",
        headerText: "text-amber-900",
        title: "Aguardando confirmação",
        description:
          "Seu agendamento foi recebido e está aguardando a confirmação da barbearia. Você será avisado em breve.",
        badge: "Pendente",
        badgeColor: "bg-amber-100 text-amber-800",
      };
    case "CONFIRMED":
      return {
        icon: <CheckCircle size={40} className="text-white" />,
        headerBg: "bg-green-500",
        headerText: "text-green-900",
        title: "Horário confirmado!",
        description:
          "Ótima notícia! Seu horário foi confirmado pela barbearia. Anote o horário e chegue com alguns minutos de antecedência.",
        badge: "Confirmado",
        badgeColor: "bg-green-100 text-green-800",
      };
    case "CANCELED":
      return {
        icon: <XCircle size={40} className="text-white" />,
        headerBg: "bg-red-500",
        headerText: "text-red-900",
        title: "Horário não disponível",
        description:
          "Infelizmente este horário não pôde ser atendido. Entre em contato com a barbearia para remarcar.",
        badge: "Cancelado",
        badgeColor: "bg-red-100 text-red-800",
      };
    case "COMPLETED":
      return {
        icon: <CheckCheck size={40} className="text-white" />,
        headerBg: "bg-blue-500",
        headerText: "text-blue-900",
        title: "Atendimento concluído",
        description: "Obrigado pela visita! Esperamos te ver em breve.",
        badge: "Concluído",
        badgeColor: "bg-blue-100 text-blue-800",
      };
  }
}

function buildWhatsAppLink(
  phone: string,
  status: AppointmentStatus,
  appointment: AppointmentData
): string {
  const digits = phone.replace(/\D/g, "");
  const phoneWithDDI = digits.startsWith("55") ? digits : `55${digits}`;

  const dateLabel = formatDateDisplay(appointment.date);

  const messages: Record<string, string> = {
    PENDING: `Olá! Fiz um agendamento de *${appointment.serviceName}* para o dia *${dateLabel}* às *${appointment.startTime}*. Queria confirmar se está tudo certo. Meu nome é *${appointment.customerName}*.`,
    CONFIRMED: `Olá! Vi que meu agendamento de *${appointment.serviceName}* para o dia *${dateLabel}* às *${appointment.startTime}* foi confirmado. Obrigado!`,
    CANCELED: `Olá! Vi que meu horário de *${appointment.serviceName}* para o dia *${dateLabel}* às *${appointment.startTime}* foi cancelado. Podemos remarcar para outro horário?`,
    COMPLETED: `Olá! Obrigado pelo atendimento de *${appointment.serviceName}* no dia *${dateLabel}*. Foi ótimo!`,
  };

  const text = encodeURIComponent(messages[status] ?? messages.PENDING);
  return `https://wa.me/${phoneWithDDI}?text=${text}`;
}

type Props = {
  appointment: AppointmentData;
};

export function AppointmentStatusCard({ appointment }: Props) {
  const config = getStatusConfig(appointment.status);
  const whatsappLink = appointment.businessPhone
    ? buildWhatsAppLink(
        appointment.businessPhone,
        appointment.status,
        appointment
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Card principal */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header colorido por status */}
        <div className={`${config.headerBg} px-6 py-8 text-center`}>
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {config.icon}
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">{config.title}</h1>
          <p className="text-white/80 text-sm mt-1 max-w-xs mx-auto">
            {config.description}
          </p>
        </div>

        {/* Detalhes */}
        <div className="px-6 py-5 space-y-4">
          {/* Badge de status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Status
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${config.badgeColor}`}
            >
              {config.badge}
            </span>
          </div>

          <div className="border-t border-slate-100" />

          {/* Informações do agendamento */}
          <div className="space-y-3">
            {/* Cliente */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-slate-600 text-sm font-bold">
                  {appointment.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cliente</p>
                <p className="text-sm font-medium text-slate-900">
                  {appointment.customerName}
                </p>
              </div>
            </div>

            {/* Serviço */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Scissors size={15} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Serviço</p>
                <p className="text-sm font-medium text-slate-900">
                  {appointment.serviceName}
                </p>
              </div>
            </div>

            {/* Data e horário */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={15} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Data e horário</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDateDisplay(appointment.date)} às {appointment.startTime}
                  <span className="text-slate-400 font-normal">
                    {" "}(até {appointment.endTime})
                  </span>
                </p>
              </div>
            </div>

            {/* Negócio */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Phone size={15} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Barbearia</p>
                <p className="text-sm font-medium text-slate-900">
                  {appointment.businessName}
                </p>
                {appointment.businessPhone && (
                  <p className="text-xs text-slate-400">
                    {appointment.businessPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Observações */}
            {appointment.notes && (
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400 mb-0.5">Observações</p>
                <p className="text-sm text-slate-600 italic">
                  "{appointment.notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botão WhatsApp */}
        {whatsappLink && (
          <div className="px-6 pb-5 space-y-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <MessageCircle size={18} />
              {appointment.status === "CANCELED"
                ? "Remarcar pelo WhatsApp"
                : "Falar com a barbearia"}
            </a>
          </div>
        )}
      </div>

      {/* Instruções contextuais */}
      {appointment.status === "CONFIRMED" && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <h3 className="text-sm font-semibold text-green-900 mb-2">
            📋 Lembre-se
          </h3>
          <ul className="space-y-1.5 text-sm text-green-800">
            <li>• Chegue com alguns minutos de antecedência</li>
            <li>
              • Em caso de imprevisto, avise a barbearia pelo WhatsApp
            </li>
            <li>
              • Seu horário:{" "}
              <strong>
                {appointment.startTime} de {formatDateDisplay(appointment.date)}
              </strong>
            </li>
          </ul>
        </div>
      )}

      {appointment.status === "CANCELED" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2">
            O que fazer agora?
          </h3>
          <ul className="space-y-1.5 text-sm text-red-800">
            <li>• Entre em contato pelo WhatsApp para remarcar</li>
            <li>• Você também pode fazer um novo agendamento online</li>
          </ul>
        </div>
      )}

      {appointment.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">
            ⏳ Aguardando
          </h3>
          <p className="text-sm text-amber-800">
            Guarde o link desta página para acompanhar o status do seu agendamento. A barbearia irá confirmar em breve.
          </p>
        </div>
      )}

      {/* Link para novo agendamento */}
      {(appointment.status === "CANCELED" || appointment.status === "COMPLETED") && (
        <div className="text-center">
          <Link
            href={`/${appointment.businessSlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
          >
            <ArrowLeft size={14} />
            Fazer novo agendamento
          </Link>
        </div>
      )}
    </div>
  );
}
