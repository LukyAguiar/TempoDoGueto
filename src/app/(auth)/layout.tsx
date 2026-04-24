import { Background } from "@/components/auth/Background";
import { Branding } from "@/components/auth/Branding";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Background />

      <div className="relative z-10 w-full max-w-md">
        <Branding />
        {children}
      </div>
    </div>
  );
}
