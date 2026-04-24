"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { X, Plus } from "lucide-react";
import { adminCreateUser } from "@/server/actions/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export function CreateUserModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await adminCreateUser(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  function handleClose() {
    reset();
    setServerError(null);
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Novo barbeiro
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">
                Criar barbeiro
              </h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
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
                placeholder="joao@barbearia.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Senha inicial"
                type="password"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                hint="O barbeiro poderá alterar depois nas configurações"
                {...register("password")}
              />

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Criar barbeiro
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
