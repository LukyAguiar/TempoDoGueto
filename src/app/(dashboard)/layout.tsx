import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { DashboardSidebar } from "@/components/ui/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
