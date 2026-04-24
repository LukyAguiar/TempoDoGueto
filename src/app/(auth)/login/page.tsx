import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginCard } from "@/components/auth/LoginCard";
import { LoginFooter } from "@/components/auth/LoginFooter";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Entrar — Tempo do Gueto" };

export default function LoginPage() {
  return (
    <LoginCard>
      {/* Título */}
      <div className="text-center mb-7">
        <h2
          className="text-2xl font-bold text-white"
          style={{ letterSpacing: "-0.3px" }}
        >
          Acesse seu painel
        </h2>
        <p
          className="text-sm mt-2 leading-snug"
          style={{ color: "#a1a1aa" }}
        >
          Gerencie horários, serviços e agendamentos
          <br />
          de forma simples e rápida.
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <LoginFooter />
    </LoginCard>
  );
}
