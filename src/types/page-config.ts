export type Theme = "barber" | "salon" | "minimal" | "premium";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  bio?: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  caption?: string;
};

export type SectionKey = "hero" | "services" | "team" | "gallery" | "location" | "contact";

export type PageConfig = {
  id: string;
  businessId: string;
  theme: Theme;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBg: string;
  textColor: string;
  buttonText: string;
  slogan: string | null;
  instagram: string | null;
  whatsapp: string | null;
  bannerUrl: string | null;
  overlayOpacity: number;
  sections: SectionKey[];
  teamMembers: TeamMember[];
  gallery: GalleryItem[];
  showPrices: boolean;
  showDuration: boolean;
};

export type ThemeDefinition = {
  id: Theme;
  name: string;
  description: string;
  preview: string; // hex color for preview swatch
  defaults: Partial<Omit<PageConfig, "id" | "businessId">>;
};

export const THEMES: ThemeDefinition[] = [
  {
    id: "barber",
    name: "Barbearia",
    description: "Urbano, escuro e dourado. Para barbearias com atitude.",
    preview: "#f6b914",
    defaults: {
      primaryColor: "#f6b914",
      accentColor: "#f6b914",
      bgColor: "#0a0a0a",
      cardBg: "#161616",
      textColor: "#ffffff",
      buttonText: "Agendar agora",
    },
  },
  {
    id: "salon",
    name: "Salão Feminino",
    description: "Elegante, rose e clean. Para salões modernos.",
    preview: "#e879a0",
    defaults: {
      primaryColor: "#e879a0",
      accentColor: "#c55a82",
      bgColor: "#fdf8f9",
      cardBg: "#ffffff",
      textColor: "#1a1a1a",
      buttonText: "Reservar horário",
    },
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Clean, branco e preciso. Para quem ama o essencial.",
    preview: "#18181b",
    defaults: {
      primaryColor: "#18181b",
      accentColor: "#52525b",
      bgColor: "#f9fafb",
      cardBg: "#ffffff",
      textColor: "#111827",
      buttonText: "Ver disponibilidade",
    },
  },
  {
    id: "premium",
    name: "Premium Dark",
    description: "Sofisticado, escuro e índigo. Para experiências VIP.",
    preview: "#6366f1",
    defaults: {
      primaryColor: "#6366f1",
      accentColor: "#818cf8",
      bgColor: "#030712",
      cardBg: "#0f1629",
      textColor: "#f8fafc",
      buttonText: "Agendar sessão",
    },
  },
];

export const DEFAULT_PAGE_CONFIG: Omit<PageConfig, "id" | "businessId"> = {
  theme: "barber",
  primaryColor: "#f6b914",
  accentColor: "#f6b914",
  bgColor: "#0a0a0a",
  cardBg: "#161616",
  textColor: "#ffffff",
  buttonText: "Agendar agora",
  slogan: null,
  instagram: null,
  whatsapp: null,
  bannerUrl: null,
  overlayOpacity: 50,
  sections: ["hero", "services", "team", "gallery", "location"],
  teamMembers: [],
  gallery: [],
  showPrices: true,
  showDuration: true,
};
