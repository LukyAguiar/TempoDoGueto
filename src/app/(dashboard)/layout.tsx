import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { DashboardSidebar } from "@/components/ui/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <DashboardSidebar user={session.user} />

      {/* Conteúdo principal — padding-top no mobile para não ficar atrás do hamburger */}
      <main
        className="flex-1 overflow-auto pt-16 md:pt-0 px-4 md:px-8 py-6 md:py-8"
        style={{ minWidth: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
