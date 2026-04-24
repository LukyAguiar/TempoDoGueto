"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Power, PowerOff } from "lucide-react";
import { adminToggleBusiness } from "@/server/actions/admin";

type Props = {
  businessId: string;
  isActive: boolean;
};

export function BusinessToggle({ businessId, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await adminToggleBusiness(businessId, !isActive);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isActive ? "Desativar barbearia" : "Ativar barbearia"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? "text-red-600 hover:bg-red-50 border border-red-200"
          : "text-green-700 hover:bg-green-50 border border-green-200"
      }`}
    >
      {isActive ? <PowerOff size={13} /> : <Power size={13} />}
      {isActive ? "Desativar" : "Ativar"}
    </button>
  );
}
