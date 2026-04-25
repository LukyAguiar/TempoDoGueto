"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { serviceSchema, type ServiceInput } from "@/schemas/service";
import { saveService } from "@/server/actions/service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Props = {
  serviceId?: string;
  defaultValues?: Partial<{ name: string; durationMinutes: number; price: string; isActive: boolean }>;
  onSuccess?: () => void;
};

export function ServiceForm({ serviceId, defaultValues, onSuccess }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      durationMinutes: defaultValues?.durationMinutes ?? 30,
      price: defaultValues?.price ?? "",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  async function onSubmit(data: ServiceInput) {
    setServerError(null);
    const result = await saveService(data, serviceId);
    if (!result.success) { setServerError(result.error); return; }
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {serverError && (
        <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          {serverError}
        </div>
      )}

      <Input label="Nome do serviço" placeholder="Corte de cabelo" error={errors.name?.message} {...register("name")} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Duração (min)" type="number" min={15} step={15} error={errors.durationMinutes?.message} {...register("durationMinutes", { valueAsNumber: true })} />
        <Input label="Preço (opcional)" type="number" step="0.01" min="0" placeholder="50.00" error={errors.price?.message} {...register("price")} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          className="rounded"
          style={{ accentColor: "#f6b914" }}
          {...register("isActive")}
        />
        <label htmlFor="isActive" className="text-sm" style={{ color: "#a1a1aa" }}>
          Serviço ativo
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" size="sm" loading={isSubmitting}>
          {serviceId ? "Salvar" : "Adicionar serviço"}
        </Button>
      </div>
    </form>
  );
}
