"use client";

import { MapPin, Phone, Instagram, Scissors, Clock, Users } from "lucide-react";
import type { PageConfig } from "@/types/page-config";
import { formatCurrency } from "@/lib/utils";

type Props = {
  config: PageConfig;
  businessName: string;
  businessBio?: string | null;
  businessAddress?: string | null;
  businessPhone?: string | null;
};

// Mock services for preview
const MOCK_SERVICES = [
  { id: "1", name: "Corte Degradê", durationMinutes: 45, price: 45 },
  { id: "2", name: "Barba Completa", durationMinutes: 30, price: 35 },
  { id: "3", name: "Corte + Barba", durationMinutes: 70, price: 70 },
];

export function PublicPagePreview({ config, businessName, businessBio, businessAddress, businessPhone }: Props) {
  const primary = config.primaryColor;
  const bg = config.bgColor;
  const cardBg = config.cardBg;
  const textColor = config.textColor;
  const isDark = isColorDark(bg);

  // Determine text colors based on bg
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const textSub = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  // Button text color: black for light buttons, white for dark
  const btnTextColor = isColorDark(primary) ? "#ffffff" : "#000000";

  const activeServices = MOCK_SERVICES;

  return (
    <div style={{ backgroundColor: bg, color: textColor, minHeight: "100%", fontFamily: "system-ui, sans-serif" }}>
      {/* ── HERO ── */}
      {config.sections.includes("hero") && (
        <div className="relative" style={{ minHeight: 220 }}>
          {/* Banner / background */}
          {config.bannerUrl ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${config.bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(0,0,0,${config.overlayOpacity / 100})` }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${bg}, ${primary}22)`,
              }}
            />
          )}

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 py-10">
            <div
              className="mb-3 h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ backgroundColor: primary, color: btnTextColor, boxShadow: `0 0 24px ${primary}55` }}
            >
              {businessName.charAt(0).toUpperCase()}
            </div>
            <h1
              className="text-2xl font-black leading-tight mb-1"
              style={{ color: config.bannerUrl ? "#fff" : textColor }}
            >
              {businessName}
            </h1>
            {config.slogan && (
              <p className="text-sm font-medium mb-2" style={{ color: config.bannerUrl ? "rgba(255,255,255,0.75)" : textMuted }}>
                {config.slogan}
              </p>
            )}
            {businessBio && (
              <p className="text-xs max-w-[280px] leading-relaxed mb-4" style={{ color: config.bannerUrl ? "rgba(255,255,255,0.60)" : textMuted }}>
                {businessBio}
              </p>
            )}

            {/* Socials */}
            <div className="flex items-center gap-2 flex-wrap justify-center mb-4">
              {businessAddress && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: config.bannerUrl ? "rgba(255,255,255,0.75)" : textSub }}>
                  <MapPin size={10} /> {businessAddress}
                </span>
              )}
              {config.whatsapp && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(37,211,102,0.15)", color: "#25d366" }}>
                  <Phone size={10} /> WhatsApp
                </span>
              )}
              {config.instagram && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(228,64,95,0.12)", color: "#e4405f" }}>
                  <Instagram size={10} /> {config.instagram}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <button
              className="px-6 py-2.5 rounded-2xl text-sm font-black transition-all"
              style={{
                backgroundColor: primary,
                color: btnTextColor,
                boxShadow: `0 4px 16px ${primary}44`,
              }}
            >
              {config.buttonText}
            </button>
          </div>
        </div>
      )}

      {/* ── SERVICES ── */}
      {config.sections.includes("services") && (
        <div className="px-4 py-6">
          <SectionTitle label="Nossos Serviços" primary={primary} textColor={textColor} />
          <div className="space-y-2 mt-3">
            {activeServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-[14px] px-4 py-3 transition-all"
                style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primary}18` }}>
                    <Scissors size={14} style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: textColor }}>{service.name}</p>
                    {config.showDuration && (
                      <p className="text-[11px] flex items-center gap-1" style={{ color: textMuted }}>
                        <Clock size={10} /> {service.durationMinutes} min
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.showPrices && service.price && (
                    <span className="text-sm font-black" style={{ color: primary }}>
                      {formatCurrency(service.price)}
                    </span>
                  )}
                  <button
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{ backgroundColor: primary, color: btnTextColor }}
                  >
                    {config.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TEAM ── */}
      {config.sections.includes("team") && config.teamMembers.length > 0 && (
        <div className="px-4 py-6" style={{ borderTop: `1px solid ${borderColor}` }}>
          <SectionTitle label="Nossa Equipe" primary={primary} textColor={textColor} />
          <div className="grid grid-cols-2 gap-3 mt-3">
            {config.teamMembers.slice(0, 4).map((member) => (
              <div
                key={member.id}
                className="rounded-[16px] p-3 text-center"
                style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
              >
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name}
                    className="h-12 w-12 rounded-full object-cover mx-auto mb-2" />
                ) : (
                  <div className="h-12 w-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-black"
                    style={{ backgroundColor: `${primary}22`, color: primary }}>
                    {member.name.charAt(0) || "?"}
                  </div>
                )}
                <p className="text-xs font-bold" style={{ color: textColor }}>{member.name || "Profissional"}</p>
                <p className="text-[11px]" style={{ color: textMuted }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TEAM empty state ── */}
      {config.sections.includes("team") && config.teamMembers.length === 0 && (
        <div className="px-4 py-6" style={{ borderTop: `1px solid ${borderColor}` }}>
          <SectionTitle label="Nossa Equipe" primary={primary} textColor={textColor} />
          <div className="mt-3 rounded-[16px] py-8 flex flex-col items-center justify-center"
            style={{ backgroundColor: cardBg, border: `2px dashed ${borderColor}` }}>
            <Users size={20} style={{ color: textMuted }} className="mb-2" />
            <p className="text-xs" style={{ color: textMuted }}>Adicione profissionais na aba Equipe</p>
          </div>
        </div>
      )}

      {/* ── LOCATION ── */}
      {config.sections.includes("location") && businessAddress && (
        <div className="px-4 py-6" style={{ borderTop: `1px solid ${borderColor}` }}>
          <SectionTitle label="Onde Estamos" primary={primary} textColor={textColor} />
          <div className="mt-3 rounded-[16px] p-4 flex items-center gap-3"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primary}18` }}>
              <MapPin size={16} style={{ color: primary }} />
            </div>
            <p className="text-sm" style={{ color: textSub }}>{businessAddress}</p>
          </div>
        </div>
      )}

      {/* ── CONTACT ── */}
      {config.sections.includes("contact") && (config.whatsapp || config.instagram) && (
        <div className="px-4 py-6" style={{ borderTop: `1px solid ${borderColor}` }}>
          <SectionTitle label="Fale Conosco" primary={primary} textColor={textColor} />
          <div className="mt-3 space-y-2">
            {config.whatsapp && (
              <div className="rounded-[14px] p-3 flex items-center gap-3"
                style={{ backgroundColor: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.15)" }}>
                <Phone size={15} style={{ color: "#25d366" }} />
                <p className="text-sm font-semibold" style={{ color: "#25d366" }}>WhatsApp</p>
              </div>
            )}
            {config.instagram && (
              <div className="rounded-[14px] p-3 flex items-center gap-3"
                style={{ backgroundColor: "rgba(228,64,95,0.08)", border: "1px solid rgba(228,64,95,0.15)" }}>
                <Instagram size={15} style={{ color: "#e4405f" }} />
                <p className="text-sm font-semibold" style={{ color: "#e4405f" }}>{config.instagram}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Powered by */}
      <div className="px-4 py-5 text-center" style={{ borderTop: `1px solid ${borderColor}` }}>
        <p className="text-[10px]" style={{ color: textMuted }}>
          Powered by <span style={{ color: primary, fontWeight: 700 }}>Tempo do Gueto</span>
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ label, primary, textColor }: { label: string; primary: string; textColor: string }) {
  return (
    <div>
      <h2 className="text-base font-black" style={{ color: textColor }}>{label}</h2>
      <div className="mt-1 h-0.5 w-8 rounded-full" style={{ backgroundColor: primary }} />
    </div>
  );
}

function isColorDark(hex: string): boolean {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } catch {
    return true;
  }
}
