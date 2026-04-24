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
  defaultValues?: Partial<{
    name: string;
    durationMinutes: number;
    price: string | number | null;
    isActive: boolean;
  }>;
  onSuccess?: () => void;
};

export function ServiceForm({ serviceId, defaultValues, onSuccess }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      durationMinutes: defaultValues?.durationMinutes ?? 30,
      price: defaultValues?.price ? Number(defaultValues.price) : null,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  async function onSubmit(data: ServiceInput) {
    setServerError(null);
    const result = await saveService(data, serviceId);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <Input
        label="Nome do serviço"
        placeholder="Corte de cabelo"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Duração (minutos)"
        type="number"
        min={15}
        step={15}
        error={errors.durationMinutes?.message}
        {...register("durationMinutes", { valueAsNumber: true })}
      />

      <Input
        label="Preço (opcional)"
        type="number"
        step="0.01"
        min="0"
        placeholder="50.00"
        error={errors.price?.message}
        {...register("price")}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          {...register("isActive")}
        />
        <label htmlFor="isActive" className="text-sm text-slate-700">
          Serviço ativo
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {serviceId ? "Salvar" : "Adicionar serviço"}
        </Button>
      </div>
    </form>
  );
}
