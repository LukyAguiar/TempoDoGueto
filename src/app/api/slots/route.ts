import { NextRequest, NextResponse } from "next/server";
import { getBusinessBySlug } from "@/server/repositories/business.repository";
import { getServiceById } from "@/server/repositories/service.repository";
import { getAvailableSlots } from "@/server/services/slots.service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!slug || !serviceId || !date) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  // Valida formato da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  const service = await getServiceById(serviceId);
  if (!service || service.businessId !== business.id || !service.isActive) {
    return NextResponse.json({ error: "Serviço inválido." }, { status: 400 });
  }

  const slots = await getAvailableSlots({
    businessId: business.id,
    date,
    durationMinutes: service.durationMinutes,
  });

  return NextResponse.json({ slots });
}
