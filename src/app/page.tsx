import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Redireciona com base no role
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/dashboard");
}
