"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, PowerOff, Power, KeyRound, X } from "lucide-react";
import { adminToggleUser, adminResetPassword } from "@/server/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
};

export function UserActionsMenu({ userId, isActive, isSelf }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setOpen(false);
    await adminToggleUser(userId, !isActive);
    setLoading(false);
    router.refresh();
  }

  async function handleResetPassword() {
    setError(null);
    setLoading(true);
    const result = await adminResetPassword(userId, newPassword);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setNewPassword("");
    setResetOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          {/* Overlay para fechar */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-1 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {/* Reset de senha */}
            <button
              onClick={() => {
                setOpen(false);
                setResetOpen(true);
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <KeyRound size={15} />
              Redefinir senha
            </button>

            {/* Ativar / desativar */}
            {!isSelf && (
              <button
                onClick={handleToggle}
                disabled={loading}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors disabled:opacity-50 ${
                  isActive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-green-700 hover:bg-green-50"
                }`}
              >
                {isActive ? (
                  <>
                    <PowerOff size={15} />
                    Desativar acesso
                  </>
                ) : (
                  <>
                    <Power size={15} />
                    Ativar acesso
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}

      {/* Modal de reset de senha */}
      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">
                Redefinir senha
              </h2>
              <button
                onClick={() => {
                  setResetOpen(false);
                  setNewPassword("");
                  setError(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Input
                label="Nova senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setResetOpen(false);
                    setNewPassword("");
                    setError(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  loading={loading}
                  onClick={handleResetPassword}
                  disabled={newPassword.length < 6}
                >
                  Salvar nova senha
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
