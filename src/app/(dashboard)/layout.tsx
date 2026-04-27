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

      <main
        className="flex-1 overflow-auto px-4 sm:px-6 lg:px-10 pt-20 md:pt-8 pb-24"
        style={{ minWidth: 0 }}
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
