"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { Palette, Monitor, Save, ExternalLink, Loader2, Plus, X, GripVertical, Users, Image as ImageIcon, Type, Layout, Check } from "lucide-react";
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

type Tab = "theme" | "content" | "colors" | "sections" | "team";

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Topo / Hero",
  services: "Serviços",
  team: "Equipe",
  gallery: "Galeria",
  location: "Localização",
  contact: "Contato",
};

const ALL_SECTIONS: SectionKey[] = ["hero", "services", "team", "gallery", "location", "contact"];

export function AppearanceEditor({
  initialConfig,
  businessSlug,
  businessName,
  businessBio,
  businessAddress,
  businessPhone,
}: Props) {
  const [config, setConfig] = useState<PageConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<Tab>("theme");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const dragRef = useRef<number | null>(null);

  function update<K extends keyof PageConfig>(key: K, value: PageConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function applyTheme(themeId: Theme) {
    const theme = THEMES.find((t) => t.id === themeId)!;
    setConfig((prev) => ({ ...prev, theme: themeId, ...theme.defaults }));
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
    const member: TeamMember = { id: nanoid(), name: "", role: "", bio: "", photoUrl: "" };
    update("teamMembers", [...config.teamMembers, member]);
  }

  function updateMember(id: string, field: keyof TeamMember, value: string) {
    update("teamMembers", config.teamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function removeMember(id: string) {
    update("teamMembers", config.teamMembers.filter((m) => m.id !== id));
  }

  function toggleSection(key: SectionKey) {
    if (key === "hero") return; // hero is always on
    const active = config.sections.includes(key);
    if (active) {
      update("sections", config.sections.filter((s) => s !== key));
    } else {
      update("sections", [...config.sections, key]);
    }
  }

  const inputCls = "w-full rounded-[12px] px-3.5 py-2.5 text-sm outline-none h-10 transition-all duration-150 placeholder:text-zinc-600";
  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#f4f4f5",
  };
  const labelCls = "block text-[11px] font-semibold uppercase tracking-wider mb-1.5";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "theme",    label: "Tema",     icon: <Palette size={15} /> },
    { id: "content",  label: "Conteúdo", icon: <Type size={15} /> },
    { id: "colors",   label: "Cores",    icon: <div className="h-3.5 w-3.5 rounded-full" style={{ background: `conic-gradient(#f6b914, #e879a0, #6366f1, #f6b914)` }} /> },
    { id: "sections", label: "Seções",   icon: <Layout size={15} /> },
    { id: "team",     label: "Equipe",   icon: <Users size={15} /> },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* ── Editor Panel ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Save bar */}
        <div
          className="flex items-center justify-between rounded-[18px] px-5 py-3.5"
          style={{ backgroundColor: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            {saved ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" style={{ boxShadow: "0 0 6px #4ade80" }} />
                <span className="text-xs font-semibold" style={{ color: "#4ade80" }}>Salvo</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs font-semibold" style={{ color: "#fbbf24" }}>Alterações não salvas</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="xl:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa" }}
            >
              <Monitor size={13} /> Preview
            </button>
            <a
              href={`/${businessSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa" }}
            >
              <ExternalLink size={13} /> Ver live
            </a>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-[0_0_16px_rgba(246,185,20,0.25)] active:scale-[0.97]"
              style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Salvar
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div
          className="flex gap-1 rounded-[16px] p-1.5"
          style={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[12px] px-2 py-2.5 text-[12px] font-bold transition-all"
              style={
                activeTab === t.id
                  ? { backgroundColor: "#f6b914", color: "#0a0a0a" }
                  : { color: "#52525b" }
              }
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="rounded-[20px] p-5 space-y-5"
          style={{ backgroundColor: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* ── THEME TAB ── */}
          {activeTab === "theme" && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                Escolha um tema
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isActive = config.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme.id)}
                      className="relative text-left rounded-[18px] p-4 transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? "rgba(246,185,20,0.06)" : "rgba(255,255,255,0.02)",
                        border: isActive ? "1px solid rgba(246,185,20,0.35)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {isActive && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#f6b914" }}>
                          <Check size={11} strokeWidth={3} color="#0a0a0a" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-2.5">
                        <div
                          className="h-8 w-8 rounded-xl shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${theme.preview}, ${theme.preview}88)`,
                            boxShadow: isActive ? `0 0 12px ${theme.preview}66` : "none",
                          }}
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{theme.name}</p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>
                        {theme.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Preview options */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                  Opções extras
                </p>
                <label className="flex items-center justify-between rounded-[14px] px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-sm font-semibold text-white">Mostrar preços</span>
                  <div
                    onClick={() => update("showPrices", !config.showPrices)}
                    className="relative h-5 w-9 rounded-full transition-colors cursor-pointer"
                    style={{ backgroundColor: config.showPrices ? "#f6b914" : "rgba(255,255,255,0.10)" }}
                  >
                    <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: config.showPrices ? "translateX(16px)" : "translateX(2px)" }} />
                  </div>
                </label>
                <label className="flex items-center justify-between rounded-[14px] px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-sm font-semibold text-white">Mostrar duração</span>
                  <div
                    onClick={() => update("showDuration", !config.showDuration)}
                    className="relative h-5 w-9 rounded-full transition-colors cursor-pointer"
                    style={{ backgroundColor: config.showDuration ? "#f6b914" : "rgba(255,255,255,0.10)" }}
                  >
                    <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ transform: config.showDuration ? "translateX(16px)" : "translateX(2px)" }} />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── CONTENT TAB ── */}
          {activeTab === "content" && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                Textos e contato
              </p>
              <div>
                <label className={labelCls} style={{ color: "#71717a" }}>Slogan / Subtítulo</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Ex: O corte que você merece"
                  value={config.slogan ?? ""}
                  onChange={(e) => update("slogan", e.target.value || null)}
                  onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: "#71717a" }}>Texto do botão de agendamento</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Agendar agora"
                  value={config.buttonText}
                  onChange={(e) => update("buttonText", e.target.value)}
                  onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={{ color: "#71717a" }}>WhatsApp (só números)</label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="5511999999999"
                    value={config.whatsapp ?? ""}
                    onChange={(e) => update("whatsapp", e.target.value || null)}
                    onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label className={labelCls} style={{ color: "#71717a" }}>Instagram (@usuario)</label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="@minha.barbearia"
                    value={config.instagram ?? ""}
                    onChange={(e) => update("instagram", e.target.value || null)}
                    onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls} style={{ color: "#71717a" }}>URL do Banner (imagem de fundo)</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  placeholder="https://..."
                  value={config.bannerUrl ?? ""}
                  onChange={(e) => update("bannerUrl", e.target.value || null)}
                  onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: "#71717a" }}>
                  Opacidade do overlay: {config.overlayOpacity}%
                </label>
                <input
                  type="range" min={0} max={90} step={5}
                  value={config.overlayOpacity}
                  onChange={(e) => update("overlayOpacity", Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#f6b914" }}
                />
              </div>
            </div>
          )}

          {/* ── COLORS TAB ── */}
          {activeTab === "colors" && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                Cores personalizadas
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#52525b" }}>
                Aplique um tema primeiro para usar os padrões, depois personalize.
              </p>
              {[
                { key: "primaryColor" as const, label: "Cor principal (botões, destaques)" },
                { key: "accentColor" as const, label: "Cor de acento" },
                { key: "bgColor" as const, label: "Cor de fundo da página" },
                { key: "cardBg" as const, label: "Fundo dos cards" },
                { key: "textColor" as const, label: "Cor do texto" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={config[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className="h-10 w-10 rounded-xl cursor-pointer border-0 p-0.5"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs font-mono" style={{ color: "#52525b" }}>{config[key]}</p>
                  </div>
                  <div
                    className="h-8 w-8 rounded-xl shrink-0"
                    style={{ backgroundColor: config[key], border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── SECTIONS TAB ── */}
          {activeTab === "sections" && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                Seções ativas na página
              </p>
              <div className="space-y-2">
                {ALL_SECTIONS.map((section) => {
                  const isActive = config.sections.includes(section);
                  const isLocked = section === "hero";
                  return (
                    <div
                      key={section}
                      className="flex items-center justify-between rounded-[14px] px-4 py-3 transition-colors"
                      style={{
                        backgroundColor: isActive ? "rgba(246,185,20,0.04)" : "rgba(255,255,255,0.02)",
                        border: isActive ? "1px solid rgba(246,185,20,0.18)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical size={14} style={{ color: "#3f3f46" }} />
                        <span className="text-sm font-semibold text-white">
                          {SECTION_LABELS[section]}
                        </span>
                        {isLocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#52525b" }}>
                            sempre ativo
                          </span>
                        )}
                      </div>
                      {!isLocked && (
                        <div
                          onClick={() => toggleSection(section)}
                          className="relative h-5 w-9 rounded-full transition-colors cursor-pointer"
                          style={{ backgroundColor: isActive ? "#f6b914" : "rgba(255,255,255,0.10)" }}
                        >
                          <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                            style={{ transform: isActive ? "translateX(16px)" : "translateX(2px)" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TEAM TAB ── */}
          {activeTab === "team" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                  Profissionais da equipe
                </p>
                <button
                  onClick={addTeamMember}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:shadow-[0_0_12px_rgba(246,185,20,0.2)] active:scale-[0.97]"
                  style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
                >
                  <Plus size={12} /> Adicionar
                </button>
              </div>

              {config.teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-[16px]"
                  style={{ border: "2px dashed rgba(255,255,255,0.07)" }}>
                  <Users size={24} style={{ color: "#3f3f46" }} className="mb-3" />
                  <p className="text-sm font-semibold text-white">Nenhum profissional cadastrado</p>
                  <p className="text-xs mt-1" style={{ color: "#52525b" }}>
                    Adicione membros da sua equipe para exibir na página pública.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-[16px] p-4 space-y-3"
                      style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">{member.name || "Novo profissional"}</p>
                        <button onClick={() => removeMember(member.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#ef4444" }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls} style={{ color: "#71717a" }}>Nome</label>
                          <input className={inputCls} style={inputStyle} placeholder="João" value={member.name}
                            onChange={(e) => updateMember(member.id, "name", e.target.value)}
                            onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
                        </div>
                        <div>
                          <label className={labelCls} style={{ color: "#71717a" }}>Especialidade</label>
                          <input className={inputCls} style={inputStyle} placeholder="Barbeiro" value={member.role}
                            onChange={(e) => updateMember(member.id, "role", e.target.value)}
                            onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls} style={{ color: "#71717a" }}>URL da foto</label>
                        <input className={inputCls} style={inputStyle} placeholder="https://..." value={member.photoUrl ?? ""}
                          onChange={(e) => updateMember(member.id, "photoUrl", e.target.value)}
                          onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
                      </div>
                      <div>
                        <label className={labelCls} style={{ color: "#71717a" }}>Bio (opcional)</label>
                        <input className={inputCls} style={inputStyle} placeholder="Especialista em corte..." value={member.bio ?? ""}
                          onChange={(e) => updateMember(member.id, "bio", e.target.value)}
                          onFocus={e => { e.target.style.borderColor = "rgba(246,185,20,0.5)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Panel ── */}
      <div
        className={`xl:flex flex-col xl:w-[380px] shrink-0 ${showPreview ? "flex" : "hidden"} xl:flex`}
      >
        <div
          className="sticky top-4 rounded-[20px] overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", height: "calc(100vh - 120px)" }}
        >
          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: "#111", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white/[0.06] rounded-lg px-3 py-1 text-center">
                <span className="text-[11px] font-mono" style={{ color: "#52525b" }}>
                  tempogueto.com/{businessSlug}
                </span>
              </div>
            </div>
            <Monitor size={13} style={{ color: "#52525b" }} />
          </div>
          {/* Preview iframe */}
          <div className="overflow-y-auto h-full">
            <PublicPagePreview
              config={config}
              businessName={businessName}
              businessBio={businessBio}
              businessAddress={businessAddress}
              businessPhone={businessPhone ?? config.whatsapp}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
