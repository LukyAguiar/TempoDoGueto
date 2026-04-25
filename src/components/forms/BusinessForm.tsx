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

type Props = { defaultValues?: Partial<BusinessInput> };

export function BusinessForm({ defaultValues }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting, isDirty } } =
    useForm<BusinessInput>({ resolver: zodResolver(businessSchema), defaultValues: defaultValues ?? {} });

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
    if (!result.success) { setServerError(result.error); return; }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          {serverError}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
          Negócio salvo com sucesso!
        </div>
      )}

      {/* Nome e Slug lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nome do negócio" placeholder="Barbearia do João" error={errors.name?.message} {...register("name")} />
        <Input
          label="Slug (URL pública)"
          placeholder="barbearia-do-joao"
          hint={`Seu link: /${watch("slug") || "seu-slug"}`}
          error={errors.slug?.message}
          {...register("slug")}
        />
      </div>

      {/* Telefone e Endereço lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Telefone" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register("phone")} />
        <Input label="Endereço" placeholder="Rua das Flores, 123 - SP" error={errors.address?.message} {...register("address")} />
      </div>

      <Textarea label="Bio / Descrição" placeholder="Conte um pouco sobre seu negócio..." error={errors.bio?.message} {...register("bio")} />
      <Input label="URL do logotipo" placeholder="https://..." error={errors.logoUrl?.message} {...register("logoUrl")} />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty && !!defaultValues}>
          {defaultValues ? "Salvar alterações" : "Criar negócio"}
        </Button>
        {defaultValues?.slug && (
          <a
            href={`/${defaultValues.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
            style={{ color: "#f6b914" }}
          >
            Ver página pública →
          </a>
        )}
      </div>
    </form>
  );
}
