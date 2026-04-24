import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { getAllUsers } from "@/server/repositories/admin.repository";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { UserActionsMenu } from "@/components/admin/UserActionsMenu";
import { formatDateDisplay } from "@/lib/dates";

export const metadata: Metadata = { title: "Admin — Usuários" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await getAllUsers();
  const barbers = users.filter((u) => u.role === "BARBER");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {barbers.length} barbeiro(s) cadastrado(s)
          </p>
        </div>
        <CreateUserModal />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Barbeiro
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Negócio
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cadastro
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {barbers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                  Nenhum barbeiro cadastrado ainda.
                </td>
              </tr>
            )}
            {barbers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-slate-400 text-xs">{user.email}</p>
                </td>

                <td className="px-5 py-4">
                  {user.business ? (
                    <div>
                      <p className="text-slate-700 font-medium">
                        {user.business.name}
                      </p>
                      <a
                        href={`/${user.business.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline"
                      >
                        /{user.business.slug}
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      Sem negócio cadastrado
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {user.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td className="px-5 py-4 text-slate-500 text-xs">
                  {formatDateDisplay(user.createdAt.toISOString().split("T")[0])}
                </td>

                <td className="px-5 py-4 text-right">
                  <UserActionsMenu
                    userId={user.id}
                    isActive={user.isActive}
                    isSelf={user.id === session?.user?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
