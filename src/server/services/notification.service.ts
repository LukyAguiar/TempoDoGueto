/**
 * NotificationService
 *
 * Camada central de notificações. Atualmente apenas loga eventos.
 * Para ativar envio real, implemente os TODOs mantendo as mesmas assinaturas.
 *
 * Integrações futuras sugeridas:
 * - WhatsApp: Z-API, Evolution API (self-hosted), Twilio
 * - Email: Resend, Nodemailer
 * - Lembretes: Vercel Cron ou cron job
 */

export type AppointmentNotificationData = {
  appointmentId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  date: string;         // "yyyy-MM-dd"
  startTime: string;    // "HH:mm"
  businessName: string;
  businessPhone: string | null;
};

function log(event: string, data: AppointmentNotificationData) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[NotificationService] ${event}:`, {
      id: data.appointmentId,
      cliente: data.customerName,
      telefone: data.customerPhone,
      servico: data.serviceName,
      data: data.date,
      horario: data.startTime,
      negocio: data.businessName,
    });
  }
}

/** Chamada logo após criação do agendamento (status: PENDING) */
export async function notifyAppointmentCreated(
  data: AppointmentNotificationData
): Promise<void> {
  // TODO: WhatsApp para cliente: "Recebemos seu agendamento, aguarde confirmação"
  // TODO: WhatsApp/email para o dono: "Novo agendamento recebido"
  log("Agendamento criado", data);
}

/** Chamada quando barbeiro CONFIRMA o agendamento */
export async function notifyAppointmentConfirmed(
  data: AppointmentNotificationData
): Promise<void> {
  // TODO: WhatsApp para cliente: "Seu horário foi confirmado!"
  // TODO: Email para cliente com os detalhes
  log("Agendamento confirmado", data);
}

/** Chamada quando barbeiro CANCELA o agendamento */
export async function notifyAppointmentCanceled(
  data: AppointmentNotificationData
): Promise<void> {
  // TODO: WhatsApp para cliente: "Infelizmente seu horário não pôde ser atendido"
  // TODO: Email com sugestão de remarcar
  log("Agendamento cancelado", data);
}

/** Chamada quando barbeiro marca como CONCLUÍDO */
export async function notifyAppointmentCompleted(
  data: AppointmentNotificationData
): Promise<void> {
  // TODO: WhatsApp para cliente: "Obrigado pela visita! Avalie nosso serviço"
  log("Agendamento concluído", data);
}

/** Lembrete antes do horário (a ser chamado via cron) */
export async function notifyAppointmentReminder(
  data: AppointmentNotificationData
): Promise<void> {
  // TODO: WhatsApp/email 24h antes: "Lembrete: seu horário é amanhã às X"
  log("Lembrete de agendamento", data);
}

/**
 * Função central — despacha a notificação correta com base no novo status.
 * Use esta função ao mudar status para garantir cobertura completa.
 */
export async function notifyStatusChanged(
  status: "CONFIRMED" | "CANCELED" | "COMPLETED",
  data: AppointmentNotificationData
): Promise<void> {
  switch (status) {
    case "CONFIRMED":
      return notifyAppointmentConfirmed(data);
    case "CANCELED":
      return notifyAppointmentCanceled(data);
    case "COMPLETED":
      return notifyAppointmentCompleted(data);
  }
}
