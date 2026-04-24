import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.appointment.deleteMany();
  await prisma.blockedSlot.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin ──────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@agendafacil.com",
      passwordHash: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
      isActive: true,
    },
  });

  // ── Barbeiro de teste ──────────────────────────────────────
  const barber = await prisma.user.create({
    data: {
      name: "João Silva",
      email: "joao@teste.com",
      passwordHash: await bcrypt.hash("senha123", 12),
      role: "BARBER",
      isActive: true,
    },
  });

  const business = await prisma.business.create({
    data: {
      userId: barber.id,
      name: "Barbearia do João",
      slug: "barbearia-do-joao",
      phone: "(11) 99999-9999",
      address: "Rua das Flores, 123 - São Paulo, SP",
      bio: "A melhor barbearia do bairro. Cortes modernos e clássicos.",
      isActive: true,
    },
  });

  await prisma.service.createMany({
    data: [
      { businessId: business.id, name: "Corte de Cabelo", durationMinutes: 30, price: 45, isActive: true },
      { businessId: business.id, name: "Barba",           durationMinutes: 30, price: 35, isActive: true },
      { businessId: business.id, name: "Corte + Barba",   durationMinutes: 60, price: 70, isActive: true },
      { businessId: business.id, name: "Hidratação",      durationMinutes: 45, price: 55, isActive: true },
    ],
  });

  await prisma.availability.createMany({
    data: [
      ...[1, 2, 3, 4, 5].map((day) => ({
        businessId: business.id,
        weekDay: day,
        startTime: "09:00",
        endTime: "18:00",
      })),
      { businessId: business.id, weekDay: 6, startTime: "09:00", endTime: "13:00" },
    ],
  });

  console.log("✅ Seed concluído!");
  console.log("");
  console.log("  👤 Admin");
  console.log("     Email: admin@agendafacil.com");
  console.log("     Senha: admin123");
  console.log("     Acesso: /admin");
  console.log("");
  console.log("  ✂️  Barbeiro");
  console.log("     Email: joao@teste.com");
  console.log("     Senha: senha123");
  console.log("     Acesso: /dashboard");
  console.log("");
  console.log("  🌐 Página pública: /barbearia-do-joao");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
