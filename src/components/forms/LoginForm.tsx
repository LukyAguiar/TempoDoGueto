"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("E-mail ou senha inválidos.");
      setIsSubmitting(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Erro servidor */}
      {serverError && (
        <div
          className="mb-5 p-3 rounded-xl text-sm text-center"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
        >
          {serverError}
        </div>
      )}

      {/* E-mail */}
      <div className="mb-5">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "#d4d4d8" }}
        >
          E-mail
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#71717a" }}
          />
          <input
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register("email")}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
            style={{
              backgroundColor: "#11151b",
              border: errors.email
                ? "1px solid rgba(239,68,68,0.5)"
                : "1px solid #2d3139",
              color: "#f4f4f5",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#f6b914";
              e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.email ? "rgba(239,68,68,0.5)" : "#2d3139";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        {errors.email && (
          <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Senha */}
      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "#d4d4d8" }}
        >
          Senha
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#71717a" }}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="w-full pl-11 pr-12 py-3 rounded-xl text-sm text-white outline-none transition-all"
            style={{
              backgroundColor: "#11151b",
              border: errors.password
                ? "1px solid rgba(239,68,68,0.5)"
                : "1px solid #2d3139",
              color: "#f4f4f5",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#f6b914";
              e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.password ? "rgba(239,68,68,0.5)" : "#2d3139";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "#71717a" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#f6b914")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#71717a")
            }
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Botão */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "#f6b914",
          color: "#0a0a0a",
          boxShadow: "0 4px 20px rgba(246,185,20,0.25)",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting)
            (e.currentTarget as HTMLElement).style.backgroundColor = "#e0a800";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#f6b914";
        }}
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        ) : (
          <>
            Entrar no painel <span className="ml-1 text-lg">→</span>
          </>
        )}
      </button>
    </form>
  );
}
