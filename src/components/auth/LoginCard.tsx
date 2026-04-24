export function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-2xl p-8"
      style={{
        backgroundColor: "rgba(11,15,20,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(246,185,20,0.30)",
        boxShadow:
          "0 0 40px rgba(246,185,20,0.15), 0 30px 70px rgba(0,0,0,0.85)",
      }}
    >
      {children}
    </div>
  );
}
