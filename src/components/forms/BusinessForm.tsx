"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { businessSchema, type BusinessInput } from "@/schemas/business";
import { saveBusiness } from "@/server/actions/business";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Props = {
  defaultValues?: Partial<BusinessInput>;
};

export function BusinessForm({ defaultValues }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema),
    defaultValues: defaultValues ?? {},
  });

  // Auto-gera slug a partir do nome (apenas se ainda não existe negócio)
  const nameValue = watch("name");
  const hasExistingSlug = !!defaultValues?.slug;

  useEffect(() => {
    if (!hasExistingSlug && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, hasExistingSlug, setValue]);

  async function onSubmit(data: BusinessInput) {
    setServerError(null);
    setSaved(false);

    const result = await saveBusiness(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          Negócio salvo com sucesso!
        </div>
      )}

      <Input
        label="Nome do negócio"
        placeholder="Barbearia do João"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Slug (URL pública)"
        placeholder="barbearia-do-joao"
        hint={`Seu link: /${watch("slug") || "seu-slug"}`}
        error={errors.slug?.message}
        {...register("slug")}
      />

      <Input
        label="Telefone"
        placeholder="(11) 99999-9999"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Input
        label="Endereço"
        placeholder="Rua das Flores, 123 - São Paulo, SP"
        error={errors.address?.message}
        {...register("address")}
      />

      <Textarea
        label="Bio / Descrição"
        placeholder="Conte um pouco sobre seu negócio..."
        error={errors.bio?.message}
        {...register("bio")}
      />

      <Input
        label="URL do logotipo"
        placeholder="https://..."
        error={errors.logoUrl?.message}
        {...register("logoUrl")}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty && !!defaultValues}>
          {defaultValues ? "Salvar alterações" : "Criar negócio"}
        </Button>
        {defaultValues?.slug && (
          <a
            href={`/${defaultValues.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 hover:underline"
          >
            Ver página pública →
          </a>
        )}
      </div>
    </form>
  );
}
