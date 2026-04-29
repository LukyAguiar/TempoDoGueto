"use client";

import { useState } from "react";
import { MapPin, Phone, Instagram, Scissors, Clock, ChevronRight, Users, Star } from "lucide-react";
import type { PageConfig, Theme } from "@/types/page-config";
import type { Service } from "@prisma/client";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { formatCurrency } from "@/lib/utils";

type Business = {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  logoUrl?: string | null;
};

type Props = {
  business: Business;
  services: Service[];
  config: PageConfig;
};

function isColorDark(hex: string): boolean {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } catch { return true; }
}

export function ThemedPublicPage({ business, services, config }: Props) {
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const primary = config.primaryColor;
  const bg = config.bgColor;
  const cardBg = config.cardBg;
  const textColor = config.textColor;
  const isDark = isColorDark(bg);
  const btnTextColor = isColorDark(primary) ? "#ffffff" : "#000000";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const textSub = isDark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.65)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  function openBooking(service?: Service) {
    setBookingService(service ?? null);
    setShowBooking(true);
  }

  // ── Booking modal overlay ──────────────────────────────────────────
  if (showBooking) {
    return (
      <div style={{ backgroundColor: bg, minHeight: "100vh", color: textColor }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <button
            onClick={() => setShowBooking(false)}
            className="flex items-center gap-1.5 text-sm font-semibold mb-6 transition-opacity hover:opacity-70"
            style={{ color: textMuted }}
          >
            ← Voltar para {business.name}
          </button>
          <BookingFlow
            slug={business.slug}
            services={services}
            initialServiceId={bookingService?.id}
            theme={config.theme}
            primaryColor={primary}
            cardBg={cardBg}
            textColor={textColor}
            buttonText={config.buttonText}
            showPrices={config.showPrices}
            showDuration={config.showDuration}
          />
        </div>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh", color: textColor }}>
      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      {config.sections.includes("hero") && (
        <HeroSection
          config={config}
          business={business}
          primary={primary}
          bg={bg}
          textColor={textColor}
          textMuted={textMuted}
          textSub={textSub}
          btnTextColor={btnTextColor}
          isDark={isDark}
          onBook={() => openBooking()}
        />
      )}

      {/* ══ SERVICES ══════════════════════════════════════════════════ */}
      {config.sections.includes("services") && (
        <ServicesSection
          services={services}
          config={config}
          primary={primary}
          cardBg={cardBg}
          textColor={textColor}
          textMuted={textMuted}
          btnTextColor={btnTextColor}
          cardBorder={cardBorder}
          borderColor={borderColor}
          onBook={openBooking}
        />
      )}

      {/* ══ TEAM ══════════════════════════════════════════════════════ */}
      {config.sections.includes("team") && config.teamMembers.length > 0 && (
        <TeamSection
          config={config}
          primary={primary}
          cardBg={cardBg}
          textColor={textColor}
          textMuted={textMuted}
          cardBorder={cardBorder}
          borderColor={borderColor}
        />
      )}

      {/* ══ LOCATION ══════════════════════════════════════════════════ */}
      {config.sections.includes("location") && business.address && (
        <LocationSection
          address={business.address}
          primary={primary}
          cardBg={cardBg}
          textColor={textColor}
          textMuted={textMuted}
          cardBorder={cardBorder}
          borderColor={borderColor}
        />
      )}

      {/* ══ CONTACT ══════════════════════════════════════════════════ */}
      {config.sections.includes("contact") && (config.whatsapp || config.instagram || business.phone) && (
        <ContactSection
          config={config}
          businessPhone={business.phone}
          primary={primary}
          cardBg={cardBg}
          textColor={textColor}
          borderColor={borderColor}
          cardBorder={cardBorder}
        />
      )}

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="px-4 py-8 text-center" style={{ borderTop: `1px solid ${borderColor}` }}>
        <p className="text-xs" style={{ color: textMuted }}>
          © {new Date().getFullYear()} {business.name} · Powered by{" "}
          <span style={{ color: primary, fontWeight: 700 }}>Tempo do Gueto</span>
        </p>
      </footer>
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection({ config, business, primary, bg, textColor, textMuted, textSub, btnTextColor, isDark, onBook }: any) {
  const hasBanner = !!config.bannerUrl;
  const heroText = hasBanner ? "#ffffff" : textColor;
  const heroMuted = hasBanner ? "rgba(255,255,255,0.68)" : textMuted;

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      {hasBanner ? (
        <>
          <div className="absolute inset-0"
            style={{ backgroundImage: `url(${config.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${config.overlayOpacity / 100})` }} />
        </>
      ) : (
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${bg} 0%, ${primary}15 100%)` }} />
      )}

      {/* Decorative glow */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: primary }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        {/* Logo */}
        {business.logoUrl ? (
          <img src={business.logoUrl} alt={business.name}
            className="h-24 w-24 rounded-3xl object-cover mb-5 shadow-2xl"
            style={{ boxShadow: `0 0 40px ${primary}44` }} />
        ) : (
          <div className="h-20 w-20 rounded-3xl flex items-center justify-center text-3xl font-black mb-5"
            style={{ backgroundColor: primary, color: btnTextColor, boxShadow: `0 0 40px ${primary}55` }}>
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name */}
        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-2"
          style={{ color: heroText, textShadow: hasBanner ? "0 2px 12px rgba(0,0,0,0.5)" : "none" }}>
          {business.name}
        </h1>

        {/* Slogan */}
        {config.slogan && (
          <p className="text-lg font-medium mb-3" style={{ color: heroMuted }}>
            {config.slogan}
          </p>
        )}

        {/* Bio */}
        {business.bio && (
          <p className="text-sm max-w-md leading-relaxed mb-6" style={{ color: heroMuted }}>
            {business.bio}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {business.address && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: hasBanner ? "rgba(255,255,255,0.12)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
                color: heroMuted, backdropFilter: "blur(8px)" }}>
              <MapPin size={11} /> {business.address}
            </span>
          )}
          {(config.whatsapp || business.phone) && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(37,211,102,0.15)", color: "#25d366" }}>
              <Phone size={11} /> WhatsApp
            </span>
          )}
          {config.instagram && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(228,64,95,0.12)", color: "#e4405f" }}>
              <Instagram size={11} /> {config.instagram}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onBook}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black transition-all duration-200 active:scale-[0.97]"
          style={{
            backgroundColor: primary,
            color: btnTextColor,
            boxShadow: `0 8px 32px ${primary}55`,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${primary}66`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${primary}55`; }}
        >
          {config.buttonText}
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

function ServicesSection({ services, config, primary, cardBg, textColor, textMuted, btnTextColor, cardBorder, borderColor, onBook }: any) {
  if (services.length === 0) return null;
  return (
    <section className="px-4 py-12 max-w-2xl mx-auto" style={{ borderTop: `1px solid ${borderColor}` }}>
      <SectionHeader label="Nossos Serviços" sub={`${services.length} serviço${services.length !== 1 ? "s" : ""} disponíve${services.length !== 1 ? "is" : "l"}`} primary={primary} textColor={textColor} textMuted={textMuted} />
      <div className="mt-6 space-y-3">
        {services.map((service: Service) => (
          <div
            key={service.id}
            className="flex items-center justify-between rounded-[18px] px-5 py-4 transition-all duration-200 group"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${primary}44`; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = cardBorder; (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-[14px] flex items-center justify-center shrink-0 transition-all"
                style={{ backgroundColor: `${primary}18` }}>
                <Scissors size={17} style={{ color: primary }} />
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: textColor }}>{service.name}</p>
                {config.showDuration && (
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: textMuted }}>
                    <Clock size={11} /> {service.durationMinutes} min
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {config.showPrices && service.price && (
                <span className="text-lg font-black" style={{ color: primary }}>
                  {formatCurrency(Number(service.price))}
                </span>
              )}
              <button
                onClick={() => onBook(service)}
                className="px-4 py-2 rounded-[12px] text-sm font-black transition-all duration-150 active:scale-[0.97]"
                style={{ backgroundColor: primary, color: btnTextColor, boxShadow: `0 4px 14px ${primary}44` }}
              >
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamSection({ config, primary, cardBg, textColor, textMuted, cardBorder, borderColor }: any) {
  return (
    <section className="px-4 py-12 max-w-2xl mx-auto" style={{ borderTop: `1px solid ${borderColor}` }}>
      <SectionHeader label="Nossa Equipe" sub="Profissionais prontos para te atender" primary={primary} textColor={textColor} textMuted={textMuted} />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {config.teamMembers.map((member: any) => (
          <div key={member.id} className="rounded-[20px] p-5 text-center transition-all duration-200"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${primary}44`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = cardBorder; (e.currentTarget as HTMLElement).style.transform = ""; }}>
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name}
                className="h-16 w-16 rounded-2xl object-cover mx-auto mb-3"
                style={{ border: `2px solid ${primary}44` }} />
            ) : (
              <div className="h-16 w-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-black"
                style={{ backgroundColor: `${primary}18`, color: primary }}>
                {member.name.charAt(0) || <Users size={20} />}
              </div>
            )}
            <p className="text-sm font-bold mb-0.5" style={{ color: textColor }}>{member.name}</p>
            <p className="text-xs font-semibold" style={{ color: primary }}>{member.role}</p>
            {member.bio && (
              <p className="text-xs mt-2 leading-relaxed" style={{ color: textMuted }}>{member.bio}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Location ─────────────────────────────────────────────────────────────────

function LocationSection({ address, primary, cardBg, textColor, textMuted, cardBorder, borderColor }: any) {
  const mapsUrl = `https://maps.google.com?q=${encodeURIComponent(address)}`;
  return (
    <section className="px-4 py-12 max-w-2xl mx-auto" style={{ borderTop: `1px solid ${borderColor}` }}>
      <SectionHeader label="Onde Estamos" sub="Venha nos visitar" primary={primary} textColor={textColor} textMuted={textMuted} />
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
        className="mt-6 flex items-center gap-4 rounded-[18px] px-5 py-4 transition-all duration-200 block"
        style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, textDecoration: "none" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${primary}44`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = cardBorder; }}>
        <div className="h-12 w-12 rounded-[14px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${primary}18` }}>
          <MapPin size={20} style={{ color: primary }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: textColor }}>{address}</p>
          <p className="text-xs mt-0.5" style={{ color: primary }}>Ver no Google Maps →</p>
        </div>
      </a>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactSection({ config, businessPhone, primary, cardBg, textColor, borderColor, cardBorder }: any) {
  const phone = config.whatsapp ?? businessPhone?.replace(/\D/g, "");
  const waLink = phone ? `https://wa.me/${phone.startsWith("55") ? phone : "55" + phone}` : null;
  const igLink = config.instagram ? `https://instagram.com/${config.instagram.replace("@", "")}` : null;

  return (
    <section className="px-4 py-12 max-w-2xl mx-auto" style={{ borderTop: `1px solid ${borderColor}` }}>
      <h2 className="text-2xl font-black mb-6" style={{ color: textColor }}>Fale Conosco</h2>
      <div className="space-y-3">
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-[18px] px-5 py-4 transition-all duration-200"
            style={{ backgroundColor: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.18)", textDecoration: "none" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(37,211,102,0.14)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(37,211,102,0.08)"; }}>
            <div className="h-11 w-11 rounded-[14px] flex items-center justify-center"
              style={{ backgroundColor: "rgba(37,211,102,0.15)" }}>
              <Phone size={18} style={{ color: "#25d366" }} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: "#25d366" }}>WhatsApp</p>
              <p className="text-xs" style={{ color: "rgba(37,211,102,0.7)" }}>Falar com a equipe</p>
            </div>
          </a>
        )}
        {igLink && (
          <a href={igLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-[18px] px-5 py-4 transition-all duration-200"
            style={{ backgroundColor: "rgba(228,64,95,0.07)", border: "1px solid rgba(228,64,95,0.15)", textDecoration: "none" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(228,64,95,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(228,64,95,0.07)"; }}>
            <div className="h-11 w-11 rounded-[14px] flex items-center justify-center"
              style={{ backgroundColor: "rgba(228,64,95,0.12)" }}>
              <Instagram size={18} style={{ color: "#e4405f" }} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: "#e4405f" }}>{config.instagram}</p>
              <p className="text-xs" style={{ color: "rgba(228,64,95,0.7)" }}>Nos siga no Instagram</p>
            </div>
          </a>
        )}
      </div>
    </section>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionHeader({ label, sub, primary, textColor, textMuted }: any) {
  return (
    <div>
      <h2 className="text-2xl font-black" style={{ color: textColor }}>{label}</h2>
      <div className="flex items-center gap-3 mt-1.5">
        <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: primary }} />
        {sub && <p className="text-xs font-semibold" style={{ color: textMuted }}>{sub}</p>}
      </div>
    </div>
  );
}
