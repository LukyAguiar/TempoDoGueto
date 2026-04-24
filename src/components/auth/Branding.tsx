export function Branding() {
  return (
    <div className="text-center mb-8 select-none">
      {/* Logo PNG — fiel à referência */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-tempo-do-gueto.png"
        alt="Tempo do Gueto"
        className="mx-auto h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
        style={{ width: "clamp(200px, 55vw, 300px)" }}
      />

      {/* Tagline */}
      <p className="mt-4 text-sm" style={{ color: "#a1a1aa" }}>
        Agenda simples para{" "}
        <span style={{ color: "#f6b914", fontWeight: 600 }}>
          barbearias da quebrada
        </span>
        .
      </p>
    </div>
  );
}
