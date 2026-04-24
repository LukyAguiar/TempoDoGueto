"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { registerUser } from "@/server/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const result = await registerUser(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    // Redireciona para login após cadastro bem-sucedido
    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <Input
        label="Nome completo"
        placeholder="João Silva"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="E-mail"
        type="email"
        placeholder="joao@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Senha"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Confirmar senha"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Criar conta
      </Button>

      <p className="text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </form>
  );
}
