"use client";

import { useState, useTransition } from "react";
import {
  Monitor, Smartphone, Save, ExternalLink, Loader2,
  Plus, X, GripVertical, Users, Type, Layout, Check, Sparkles,
  Instagram, ChevronDown, ChevronUp, Eye, Image,
} from "lucide-react";
import { savePageConfig } from "@/server/actions/page-config";
import { THEMES, type PageConfig, type Theme, type TeamMember, type SectionKey } from "@/types/page-config";
import { PublicPagePreview } from "@/components/appearance/PublicPagePreview";
import { nanoid } from "@/lib/utils";

type Props = {
  initialConfig: PageConfig;
  businessSlug: string;
  businessName: string;
  businessBio?: string | null;
  businessAddress?: string | null;
  businessPhone?: string | null;
};

type Tab = "templates" | "content" | "colors" | "sections" | "team";
type DeviceMode = "mobile" | "desktop";

const SECTION_LABELS: Record<SectionKey, { label: string; description: string }> = {
  hero:     { label: "Topo / Hero",  description: "Nome, slogan e botão principal" },
  services: { label: "Serviços",     description: "Lista de serviços e preços" },
  team:     { label: "Equipe",       description: "Profissionais do negócio" },
  gallery:  { label: "Galeria",      description: "Fotos do espaço e trabalhos" },
  location: { label: "Localização",  description: "Endereço com link para o mapa" },
  contact:  { label: "Contato",      description: "WhatsApp e Instagram" },
};

const ALL_SECTIONS: SectionKey[] = ["hero", "services", "team", "gallery", "location", "contact"];

const TEMPLATE_PALETTES: Record<Theme, string[]> = {
  barber:  ["#0a0a0a", "#161616", "#f6b914", "#ffffff"],
  salon:   ["#fdf8f9", "#ffffff", "#e879a0", "#1a1a1a"],
  minimal: ["#f9fafb", "#ffffff", "#18181b", "#52525b"],
  premium: ["#030712", "#0f1629", "#6366f1", "#818cf8"],
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative h-6 w-11 rounded-full transition-all duration-200 shrink-0"
      style={{ backgroundColor: on ? "#f6b914" : "rgba(255,255,255,0.10)" }}
    >
      <div
        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? "translateX(21px)" : "translateX(4px)" }}
      />
    </button>
  );
}

function Field({ label, placeholder, value, onChange, hint }: {
  label: string; placeholder?: string; value: string;
  onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
        {label}
      </label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-[12px] px-3.5 py-2.5 text-sm outline-none h-10 transition-all duration-150 placeholder:text-zinc-700"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#f4f4f5" }}
        onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.07)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
      />
      {hint && <p className="text-[11px]" style={{ color: "#3f3f46" }}>{hint}</p>}
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2.5 px-4 py-3"
        style={{ backgroundColor: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ color: "#f6b914" }}>{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#71717a" }}>{title}</span>
      </div>
      <div className="p-4 space-y-3" style={{ backgroundColor: "rgba(255,255,255,0.01)" }}>
        {children}
      </div>
    </div>
  );
}

function TeamMemberCard({ member, onUpdate, onRemove }: {
  member: TeamMember;
  onUpdate: (field: keyof TeamMember, value: string) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!member.name);
  const inputCls = "w-full rounded-[10px] px-3 py-2 text-sm outline-none h-9 transition-all placeholder:text-zinc-700";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#f4f4f5" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "rgba(246,185,20,0.4)"; e.target.style.boxShadow = "0 0 0 2px rgba(246,185,20,0.06)"; };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; };

  return (
    <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-3 p-3">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name} className="h-10 w-10 rounded-xl object-cover shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }} />
        ) : (
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
            style={{ backgroundColor: "rgba(246,185,20,0.12)", color: "#f6b914", border: "1px solid rgba(246,185,20,0.15)" }}>
            {member.name.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{member.name || "Novo profissional"}</p>
          <p className="text-xs truncate" style={{ color: "#52525b" }}>{member.role || "Cargo não definido"}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExpanded(p => !p)} className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors" style={{ color: "#52525b" }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={onRemove} className="p-2 rounded-xl hover:bg-red-500/10 transition-colors" style={{ color: "#71717a" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={e => (e.currentTarget.style.color = "#71717a")}>
            <X size={14} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="pt-3 grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#52525b" }}>Nome</label>
              <input className={inputCls} style={inputStyle} placeholder="João" value={member.name}
                onChange={e => onUpdate("name", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#52525b" }}>Cargo</label>
              <input className={inputCls} style={inputStyle} placeholder="Barbeiro" value={member.role}
                onChange={e => onUpdate("role", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#52525b" }}>URL da foto</label>
            <input className={inputCls} style={inputStyle} placeholder="https://..." value={member.photoUrl ?? ""}
              onChange={e => onUpdate("photoUrl", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#52525b" }}>Bio</label>
            <input className={inputCls} style={inputStyle} placeholder="Especialista em degradê..." value={member.bio ?? ""}
              onChange={e => onUpdate("bio", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewPanel({ businessSlug, deviceMode, setDeviceMode, previewProps, sticky }: {
  businessSlug: string; deviceMode: DeviceMode;
  setDeviceMode: (m: DeviceMode) => void; previewProps: any; sticky: boolean;
}) {
  return (
    <div className={sticky ? "sticky top-4" : ""} style={sticky ? { height: "calc(100vh - 110px)" } : {}}>
      <div className="flex flex-col rounded-[20px] overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)", height: sticky ? "100%" : "min(85vh, 720px)", backgroundColor: "#0a0a0a" }}>
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ backgroundColor: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(248,113,113,0.5)" }} />
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(251,191,36,0.5)" }} />
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(74,222,128,0.5)" }} />
          </div>
          <div className="flex-1 rounded-lg px-3 py-1 overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[11px] font-mono block truncate text-center" style={{ color: "#52525b" }}>
              tempogueto.com/{businessSlug}
            </span>
          </div>
          {/* Device toggle */}
          <div className="flex rounded-lg p-0.5 gap-0.5 shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <button onClick={() => setDeviceMode("mobile")} className="p-1.5 rounded-md transition-all"
              style={deviceMode === "mobile" ? { backgroundColor: "#f6b914", color: "#0a0a0a" } : { color: "#52525b" }}>
              <Smartphone size={13} />
            </button>
            <button onClick={() => setDeviceMode("desktop")} className="p-1.5 rounded-md transition-all"
              style={deviceMode === "desktop" ? { backgroundColor: "#f6b914", color: "#0a0a0a" } : { color: "#52525b" }}>
              <Monitor size={13} />
            </button>
          </div>
        </div>

        {/* Preview viewport */}
        <div className="flex-1 overflow-hidden flex items-start justify-center p-3 min-h-0"
          style={{ backgroundColor: "#080808" }}>
          <div className="overflow-y-auto h-full rounded-xl transition-all duration-300 scrollbar-hide"
            style={{
              width: deviceMode === "mobile" ? "min(375px, 100%)" : "100%",
              maxWidth: "100%",
              boxShadow: deviceMode === "mobile" ? "0 0 40px rgba(0,0,0,0.7)" : "none",
            }}>
            <PublicPagePreview {...previewProps} />
          </div>
        </div>

        {/* Preview footer */}
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0"
          style={{ backgroundColor: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[10px] font-semibold" style={{ color: "#3f3f46" }}>
            {deviceMode === "mobile" ? "📱 Mobile (375px)" : "🖥️ Desktop"}
          </span>
          <a href={`/${businessSlug}`} target="_blank" rel="noopener noreferrer"
            className="text-[11px] font-bold inline-flex items-center gap-1 hover:underline transition-colors"
            style={{ color: "#f6b914" }}>
            Abrir live <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

export function AppearanceEditor({ initialConfig, businessSlug, businessName, businessBio, businessAddress, businessPhone }: Props) {
  const [config, setConfig] = useState<PageConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(true);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  function update<K extends keyof PageConfig>(key: K, value: PageConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function applyTheme(themeId: Theme) {
    const theme = THEMES.find(t => t.id === themeId)!;
    setConfig(prev => ({ ...prev, theme: themeId, ...theme.defaults }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      const { id, businessId, ...data } = config;
      const result = await savePageConfig(data);
      if (result.success) setSaved(true);
    });
  }

  function addTeamMember() {
    update("teamMembers", [...config.teamMembers, { id: nanoid(), name: "", role: "", bio: "", photoUrl: "" }]);
  }

  function updateMember(id: string, field: keyof TeamMember, value: string) {
    update("teamMembers", config.teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  function removeMember(id: string) {
    update("teamMembers", config.teamMembers.filter(m => m.id !== id));
  }

  function toggleSection(key: SectionKey) {
    if (key === "hero") return;
    const active = config.sections.includes(key);
    update("sections", active ? config.sections.filter(s => s !== key) : [...config.sections, key]);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "templates", label: "Templates", icon: <Sparkles size={14} /> },
    { id: "content",   label: "Conteúdo",  icon: <Type size={14} /> },
    { id: "colors",    label: "Cores",     icon: <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ background: "conic-gradient(#f6b914,#e879a0,#6366f1,#f6b914)" }} /> },
    { id: "sections",  label: "Seções",    icon: <Layout size={14} /> },
    { id: "team",      label: "Equipe",    icon: <Users size={14} /> },
  ];

  const previewProps = { config, businessName, businessBio, businessAddress, businessPhone: businessPhone ?? config.whatsapp };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between rounded-[16px] px-4 py-3 gap-3"
        style={{ backgroundColor: "#111", border: `1px solid ${saved ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.22)"}` }}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-2 w-2 rounded-full shrink-0 ${saved ? "" : "animate-pulse"}`}
            style={{ backgroundColor: saved ? "#4ade80" : "#fbbf24", boxShadow: saved ? "0 0 6px #4ade8066" : "0 0 6px #fbbf2466" }} />
          <span className="text-xs font-semibold truncate" style={{ color: saved ? "#4ade80" : "#fbbf24" }}>
            {saved ? "Todas as alterações salvas" : "Você tem alterações não salvas"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={`/${businessSlug}`} target="_blank" rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-white/[0.05]"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#71717a" }}>
            <ExternalLink size={12} /> Ver live
          </a>
          <button onClick={handleSave} disabled={isPending || saved}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-[0.97] disabled:opacity-50"
            style={{
              backgroundColor: saved ? "rgba(255,255,255,0.05)" : "#f6b914",
              color: saved ? "#52525b" : "#0a0a0a",
              boxShadow: saved ? "none" : "0 0 18px rgba(246,185,20,0.3)",
            }}>
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-col xl:flex-row gap-5">

        {/* ── Editor ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab nav */}
          <div className="flex gap-1 rounded-[14px] p-1" style={{ backgroundColor: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[10px] px-1.5 py-2.5 text-[11px] font-bold transition-all duration-150"
                style={activeTab === t.id
                  ? { backgroundColor: "#f6b914", color: "#0a0a0a", boxShadow: "0 2px 8px rgba(246,185,20,0.28)" }
                  : { color: "#52525b" }}>
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Content card */}
          <div className="rounded-[20px] p-5 space-y-5" style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}>

            {/* ── TEMPLATES ── */}
            {activeTab === "templates" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-white mb-0.5">Templates</h3>
                  <p className="text-xs" style={{ color: "#52525b" }}>Cada template define layout, cores e identidade visual completa.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEMES.map(theme => {
                    const isActive = config.theme === theme.id;
                    return (
                      <button key={theme.id} onClick={() => applyTheme(theme.id)}
                        className="relative text-left rounded-[18px] p-4 transition-all duration-200"
                        style={{
                          backgroundColor: isActive ? `${theme.preview}0d` : "rgba(255,255,255,0.02)",
                          border: isActive ? `1px solid ${theme.preview}55` : "1px solid rgba(255,255,255,0.06)",
                          boxShadow: isActive ? `0 0 20px ${theme.preview}1a` : "none",
                        }}>
                        {isActive && (
                          <div className="absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.preview }}>
                            <Check size={10} strokeWidth={3} color={theme.id === "minimal" || theme.id === "salon" ? "#fff" : "#000"} />
                          </div>
                        )}
                        {/* Palette strip */}
                        <div className="flex gap-1 mb-3">
                          {TEMPLATE_PALETTES[theme.id].map((c, i) => (
                            <div key={i} className="h-3 flex-1 rounded-sm first:rounded-l last:rounded-r" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        {/* Mini preview */}
                        <div className="rounded-xl overflow-hidden mb-3 h-[72px] relative"
                          style={{ backgroundColor: TEMPLATE_PALETTES[theme.id][0] }}>
                          <div className="absolute inset-0 flex flex-col justify-between p-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-3.5 w-3.5 rounded-md" style={{ backgroundColor: theme.preview }} />
                              <div className="h-1.5 w-14 rounded-full opacity-30" style={{ backgroundColor: TEMPLATE_PALETTES[theme.id][3] }} />
                            </div>
                            <div className="space-y-1">
                              <div className="h-1.5 w-20 rounded-full opacity-50" style={{ backgroundColor: TEMPLATE_PALETTES[theme.id][3] }} />
                              <div className="h-1 w-12 rounded-full opacity-25" style={{ backgroundColor: TEMPLATE_PALETTES[theme.id][3] }} />
                            </div>
                            <div className="h-5 w-16 rounded-lg" style={{ backgroundColor: theme.preview }} />
                          </div>
                        </div>
                        <p className="text-sm font-black text-white mb-0.5">{theme.name}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>{theme.description}</p>
                      </button>
                    );
                  })}
                </div>
                <Block title="Opções de exibição" icon={<Eye size={13} />}>
                  <div className="flex items-center justify-between py-0.5">
                    <div>
                      <p className="text-sm font-semibold text-white">Mostrar preços</p>
                      <p className="text-xs" style={{ color: "#52525b" }}>Exibe o valor de cada serviço</p>
                    </div>
                    <Toggle on={config.showPrices} onChange={() => update("showPrices", !config.showPrices)} />
                  </div>
                  <div className="h-px" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
                  <div className="flex items-center justify-between py-0.5">
                    <div>
                      <p className="text-sm font-semibold text-white">Mostrar duração</p>
                      <p className="text-xs" style={{ color: "#52525b" }}>Exibe o tempo de cada serviço</p>
                    </div>
                    <Toggle on={config.showDuration} onChange={() => update("showDuration", !config.showDuration)} />
                  </div>
                </Block>
              </div>
            )}

            {/* ── CONTENT ── */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white mb-0.5">Conteúdo da página</h3>
                  <p className="text-xs" style={{ color: "#52525b" }}>Textos, links e imagens da sua página pública.</p>
                </div>
                <Block title="Branding" icon={<Sparkles size={13} />}>
                  <Field label="Slogan" placeholder="O corte que você merece"
                    value={config.slogan ?? ""} onChange={v => update("slogan", v || null)}
                    hint="Aparece abaixo do nome do negócio" />
                  <Field label="Texto do botão" placeholder="Agendar agora"
                    value={config.buttonText} onChange={v => update("buttonText", v)} />
                </Block>
                <Block title="Redes Sociais" icon={<Instagram size={13} />}>
                  <Field label="WhatsApp" placeholder="5511999999999"
                    value={config.whatsapp ?? ""} onChange={v => update("whatsapp", v || null)}
                    hint="Só números com DDI. Ex: 5511999999999" />
                  <Field label="Instagram" placeholder="@minha.barbearia"
                    value={config.instagram ?? ""} onChange={v => update("instagram", v || null)} />
                </Block>
                <Block title="Banner / Fundo" icon={<Image size={13} />}>
                  <Field label="URL da imagem de fundo" placeholder="https://..."
                    value={config.bannerUrl ?? ""} onChange={v => update("bannerUrl", v || null)}
                    hint="Imagem que aparece no topo da página pública" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                        Escurecimento do overlay
                      </label>
                      <span className="text-xs font-black" style={{ color: "#f6b914" }}>{config.overlayOpacity}%</span>
                    </div>
                    <input type="range" min={0} max={90} step={5}
                      value={config.overlayOpacity}
                      onChange={e => update("overlayOpacity", Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "#f6b914" }} />
                    <div className="flex justify-between text-[10px]" style={{ color: "#3f3f46" }}>
                      <span>Sem sombra</span><span>Escuro</span>
                    </div>
                  </div>
                </Block>
              </div>
            )}

            {/* ── COLORS ── */}
            {activeTab === "colors" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-white mb-0.5">Cores personalizadas</h3>
                  <p className="text-xs" style={{ color: "#52525b" }}>Ajuste fino sobre o template ativo.</p>
                </div>
                <div className="rounded-[14px] p-3.5 flex items-center gap-3"
                  style={{ backgroundColor: "rgba(246,185,20,0.06)", border: "1px solid rgba(246,185,20,0.15)" }}>
                  <Sparkles size={15} className="shrink-0" style={{ color: "#f6b914" }} />
                  <div>
                    <p className="text-xs font-bold text-white">Template ativo: {THEMES.find(t => t.id === config.theme)?.name}</p>
                    <p className="text-[11px]" style={{ color: "#71717a" }}>Mude o template para resetar as cores.</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {([
                    { key: "primaryColor" as const,  label: "Cor principal",   desc: "Botões e destaques" },
                    { key: "accentColor" as const,   label: "Cor de acento",   desc: "Elementos secundários" },
                    { key: "bgColor" as const,       label: "Fundo da página", desc: "Background principal" },
                    { key: "cardBg" as const,        label: "Fundo dos cards", desc: "Cards e containers" },
                    { key: "textColor" as const,     label: "Cor do texto",    desc: "Texto principal" },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center gap-3 rounded-[14px] p-3 transition-colors"
                      style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="relative shrink-0 h-10 w-10 rounded-xl overflow-hidden cursor-pointer"
                        style={{ backgroundColor: config[key], border: "2px solid rgba(255,255,255,0.12)", boxShadow: `0 0 12px ${config[key]}44` }}>
                        <input type="color" value={config[key]} onChange={e => update(key, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{label}</p>
                        <p className="text-[11px]" style={{ color: "#52525b" }}>{desc}</p>
                      </div>
                      <code className="text-[11px] font-mono px-2 py-1 rounded-lg shrink-0"
                        style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#a1a1aa" }}>
                        {config[key].toUpperCase()}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTIONS ── */}
            {activeTab === "sections" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-white mb-0.5">Seções da página</h3>
                  <p className="text-xs" style={{ color: "#52525b" }}>Ative ou desative blocos da sua página pública.</p>
                </div>
                <div className="space-y-2">
                  {ALL_SECTIONS.map(section => {
                    const isActive = config.sections.includes(section);
                    const isLocked = section === "hero";
                    const { label, description } = SECTION_LABELS[section];
                    return (
                      <div key={section}
                        className="flex items-center gap-3 rounded-[14px] px-4 py-3.5 transition-all duration-150"
                        style={{
                          backgroundColor: isActive ? "rgba(246,185,20,0.04)" : "rgba(255,255,255,0.02)",
                          border: isActive ? "1px solid rgba(246,185,20,0.15)" : "1px solid rgba(255,255,255,0.06)",
                        }}>
                        <GripVertical size={14} className="shrink-0" style={{ color: "#3f3f46" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">{label}</p>
                            {isLocked && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#52525b" }}>fixo</span>
                            )}
                          </div>
                          <p className="text-[11px]" style={{ color: "#52525b" }}>{description}</p>
                        </div>
                        <Toggle on={isActive} onChange={() => toggleSection(section)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TEAM ── */}
            {activeTab === "team" && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white mb-0.5">Equipe</h3>
                    <p className="text-xs" style={{ color: "#52525b" }}>Profissionais exibidos na página pública.</p>
                  </div>
                  <button onClick={addTeamMember}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-black transition-all hover:shadow-[0_0_12px_rgba(246,185,20,0.25)] active:scale-[0.97] shrink-0"
                    style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}>
                    <Plus size={12} /> Adicionar
                  </button>
                </div>
                {config.teamMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-[18px]"
                    style={{ border: "2px dashed rgba(255,255,255,0.07)" }}>
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: "rgba(246,185,20,0.08)", border: "1px solid rgba(246,185,20,0.12)" }}>
                      <Users size={22} style={{ color: "#f6b914" }} />
                    </div>
                    <p className="text-sm font-bold text-white">Nenhum profissional ainda</p>
                    <p className="text-xs mt-1 max-w-[220px] leading-relaxed" style={{ color: "#52525b" }}>
                      Adicione membros da equipe para exibir na sua página pública.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {config.teamMembers.map(member => (
                      <TeamMemberCard key={member.id} member={member}
                        onUpdate={(field, value) => updateMember(member.id, field, value)}
                        onRemove={() => removeMember(member.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop preview ── */}
        <div className="hidden xl:flex flex-col xl:w-[420px] shrink-0">
          <PreviewPanel businessSlug={businessSlug} deviceMode={deviceMode}
            setDeviceMode={setDeviceMode} previewProps={previewProps} sticky />
        </div>
      </div>

      {/* ── Mobile preview toggle ── */}
      <div className="xl:hidden">
        <button onClick={() => setMobilePreviewOpen(p => !p)}
          className="w-full flex items-center justify-between rounded-[16px] px-5 py-4 transition-all"
          style={{
            backgroundColor: mobilePreviewOpen ? "rgba(246,185,20,0.06)" : "#111",
            border: mobilePreviewOpen ? "1px solid rgba(246,185,20,0.2)" : "1px solid rgba(255,255,255,0.07)",
          }}>
          <div className="flex items-center gap-2.5">
            <Monitor size={16} style={{ color: mobilePreviewOpen ? "#f6b914" : "#52525b" }} />
            <span className="text-sm font-bold" style={{ color: mobilePreviewOpen ? "#f6b914" : "#a1a1aa" }}>
              Preview da página pública
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: "#52525b" }}>
              {mobilePreviewOpen ? "Fechar" : "Visualizar"}
            </span>
            {mobilePreviewOpen
              ? <ChevronUp size={15} style={{ color: "#52525b" }} />
              : <ChevronDown size={15} style={{ color: "#52525b" }} />}
          </div>
        </button>

        {mobilePreviewOpen && (
          <div className="mt-3">
            <PreviewPanel businessSlug={businessSlug} deviceMode={deviceMode}
              setDeviceMode={setDeviceMode} previewProps={previewProps} sticky={false} />
          </div>
        )}
      </div>
    </div>
  );
}
