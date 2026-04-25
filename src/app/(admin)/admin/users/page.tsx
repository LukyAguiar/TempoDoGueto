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
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-sm mt-0.5" style={{color:"#71717a"}}>
            {barbers.length} barbeiro(s) cadastrado(s)
          </p>
        </div>
        <CreateUserModal />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{backgroundColor:"#1a1a1a",border:"1px solid rgba(255,255,255,0.06)"}}>
        <table className="w-full text-sm">
          <thead>
            <tr className="" style={{borderBottom:"1px solid rgba(255,255,255,0.06)",backgroundColor:"rgba(255,255,255,0.03)"}}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Barbeiro
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Negócio
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Cadastro
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="">
            {barbers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm" style={{color:"#52525b"}}>
                  Nenhum barbeiro cadastrado ainda.
                </td>
              </tr>
            )}
            {barbers.map((user) => (
              <tr key={user.id} className="transition-colors" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs" style={{color:"#52525b"}}>{user.email}</p>
                </td>

                <td className="px-5 py-4">
                  {user.business ? (
                    <div>
                      <p className="font-medium" style={{color:"#d4d4d8"}}>
                        {user.business.name}
                      </p>
                      <a
                        href={`/${user.business.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline" style={{color:"#f6b914"}}
                      >
                        /{user.business.slug}
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs italic" style={{color:"#52525b"}}>
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

                <td className="px-5 py-4 text-xs" style={{color:"#71717a"}}>
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
