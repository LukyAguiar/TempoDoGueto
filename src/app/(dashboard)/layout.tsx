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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0d0d0d" }}>
      {/* Sidebar fixa — não rola */}
      <DashboardSidebar user={session.user} />

      {/* Área de conteúdo — única que rola */}
      <main className="flex-1 overflow-y-auto min-w-0 pt-16 md:pt-0">
        <div className="px-4 sm:px-6 lg:px-10 py-8 pb-24 mx-auto w-full max-w-7xl fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
