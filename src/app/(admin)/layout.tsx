import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#0d0d0d" }}>
      <AdminSidebar user={session.user} />
      <main
        className="flex-1 overflow-auto pt-16 md:pt-0 px-4 md:px-8 py-4 md:py-8"
        style={{ minWidth: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
