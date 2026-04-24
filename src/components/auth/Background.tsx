export function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* IMAGEM PRINCIPAL */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/favela-night.png"
        alt=""
        className="w-full h-full object-cover"
      />

      {/* OVERLAY ESCURO PROFUNDO */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.78) 50%, rgba(0,0,0,0.93) 100%)",
        }}
      />

      {/* ILUMINAÇÃO AMARELA SUTIL — simula o tom quente das janelas */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(251,191,36,0.06)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
