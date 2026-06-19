"use client";
import { Search, Star, CreditCard, Users, TrendingUp, ArrowRight, ArrowUpRight, Sparkles, LayoutGrid, ChevronRight, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "@/components/Link";
import { authManager } from "@/services/authManager";

// ── Types ────────────────────────────────────────────────────────────────────
type CardItem = {
  name: string;
  bank: string;
  alias: string;
  image: string;
  joining_fee: string;
  annual_fee: string;
  networks: string;
};

type TabKey = "picks" | "best" | "beginner" | "cashback";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BANK_MAP: Record<string, string> = {
  hdfc: "HDFC Bank", sbi: "SBI Card", axis: "Axis Bank", icici: "ICICI Bank",
  kotak: "Kotak Bank", idfc: "IDFC FIRST", hsbc: "HSBC", amex: "Amex",
  "american express": "Amex", scapia: "Federal Bank", kiwi: "Kiwi",
  indusind: "IndusInd Bank", yes: "Yes Bank", rbl: "RBL Bank",
  au: "AU Small Finance", bob: "Bank of Baroda", swiggy: "HDFC Bank",
  flipkart: "SBI Card", myntra: "Kotak Bank", tata: "SBI Card",
};

function extractBank(cardName: string): string {
  const lower = cardName.toLowerCase();
  for (const [key, val] of Object.entries(BANK_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "Bank";
}

function parseRawCards(data: any): any[] {
  if (Array.isArray(data?.data?.cards)) return data.data.cards;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function formatFee(raw: any): string {
  const s = String(raw ?? "").trim();
  if (!s || s === "0" || s.toLowerCase() === "free") return "Free";
  return `₹${s}`;
}

function toCardItem(c: any): CardItem {
  const alias = c.seo_card_alias || c.card_alias || "";
  const name = c.name || c.card_name || "";
  const bank = c.bank_name || c.bank || extractBank(name);
  const image = c.card_bg_image || c.image || "";
  const joining_fee = formatFee(c.joining_fee_text ?? c.joining_fee);
  const annual_fee = formatFee(c.annual_fee_text ?? c.annual_fee);
  const networks = c.card_type || "";
  return { name, bank, alias, image, joining_fee, annual_fee, networks };
}

function curateCards(raw: any[], aliases: string[]): CardItem[] {
  const byAlias = new Map<string, any>();
  raw.forEach((c) => {
    const a = c.seo_card_alias || c.card_alias || "";
    if (a && !byAlias.has(a)) byAlias.set(a, c);
  });
  const result: CardItem[] = [];
  const used = new Set<string>();
  for (const alias of aliases) {
    if (byAlias.has(alias)) {
      result.push(toCardItem(byAlias.get(alias)));
      used.add(alias);
    }
  }
  if (result.length < 9) {
    for (const c of raw) {
      if (result.length >= 9) break;
      const a = c.seo_card_alias || c.card_alias || "";
      if (!used.has(a)) { result.push(toCardItem(c)); used.add(a); }
    }
  }
  return result.slice(0, 9);
}

// ── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "130+", label: "Cards", icon: CreditCard },
  { value: "50K+", label: "Users", icon: Users },
  { value: "₹12K", label: "Avg Saved", icon: TrendingUp },
  { value: "4.9", label: "Rating", icon: Star },
];

// ── Card Tile ────────────────────────────────────────────────────────────────
function CardTile({ card, index }: { card: CardItem; index: number }) {
  const networkList = card.networks
    ? card.networks.split(",").map((n) => n.trim()).filter(Boolean)
    : [];

  return (
    <Link
      to={card.alias ? `/cards/${card.alias}` : "/cards"}
      className="group block animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/8 hover:-translate-y-0.5 hover:border-indigo-100">
        {/* Card image */}
        <div className="h-36 sm:h-44 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center overflow-hidden relative p-4">
          <img
            src={card.image}
            alt={card.name}
            loading="lazy"
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-4">
          {networkList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {networkList.slice(0, 2).map((n) => (
                <span key={n} className="text-[10px] font-medium text-slate-400 bg-slate-50 rounded px-1.5 py-0.5 tracking-wide uppercase">
                  {n === "AmericanExpress" ? "Amex" : n}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-display text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-3 group-hover:text-[#3A49D6] transition-colors">
            {card.name}
          </h3>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{card.joining_fee === "Free" ? "No joining fee" : `Joining: ${card.joining_fee}`}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#3A49D6] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className="h-36 sm:h-44 bg-slate-50 animate-pulse" />
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        <div className="h-2.5 bg-slate-100 rounded-full w-1/4 animate-pulse" />
        <div className="h-3.5 bg-slate-100 rounded-full w-3/4 animate-pulse" />
        <div className="h-2.5 bg-slate-100 rounded-full w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

// ── Curated card aliases ─────────────────────────────────────────────────────
const CURATED_ALIASES: Record<TabKey, string[]> = {
  picks: [
    "hdfc-regalia-gold-credit-card", "sbi-cashback-credit-card", "axis-bank-magnus-credit-card",
    "hdfc-millenia-credit-card", "icici-amazon-pay-credit-card", "axis-atlas-credit-card",
    "idfc-first-wealth-credit-card", "tata-neu-infinity-sbi-credit-card", "axis-flipkart-credit-card",
  ],
  best: [
    "hdfc-infinia-credit-card", "axis-bank-magnus-credit-card", "axis-atlas-credit-card",
    "hdfc-diners-club-black", "hdfc-regalia-gold-credit-card", "sbi-aurum-credit-card",
    "icici-emeralde-private-metal-credit-card", "hdfc-marriott-bonvoy-credit-card", "axis-bank-reserve-credit-card",
  ],
  beginner: [
    "icici-amazon-pay-credit-card", "idfc-first-select-credit-card", "axis-neo-credit-card",
    "scapia-credit-card", "hdfc-pixel-play-credit-card", "kiwi-klick-credit-card",
    "kotak-811-dream-different-credit-card", "rbl-bank-play-credit-card", "idfc-first-classic-credit-card",
  ],
  cashback: [
    "sbi-cashback-credit-card", "hdfc-millenia-credit-card", "icici-amazon-pay-credit-card",
    "axis-flipkart-credit-card", "axis-cashback-credit-card", "hdfc-swiggy-credit-card",
    "hdfc-pixel-play-credit-card", "flipkart-sbi-credit-card", "hdfc-tata-neu-plus-credit-card",
  ],
};

const TAB_CONFIG: Record<TabKey, { label: string; slug: string; free_cards: string; sort_by: string }> = {
  picks:    { label: "F2 Picks",       slug: "",                          free_cards: "",     sort_by: "priority" },
  best:     { label: "Best Cards",     slug: "best-travel-credit-card",   free_cards: "",     sort_by: "priority" },
  beginner: { label: "Beginner",       slug: "",                          free_cards: "true", sort_by: "priority" },
  cashback: { label: "Best Cashback",  slug: "best-shopping-credit-card", free_cards: "",     sort_by: "priority" },
};

// ── Tabbed Picks ─────────────────────────────────────────────────────────────
function CuratedPicks() {
  const [activeTab, setActiveTab] = useState<TabKey>("picks");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Partial<Record<TabKey, CardItem[]>>>({});

  const fetchCardsForTab = (tabKey: TabKey) => {
    if (cache.current[tabKey]) {
      setCards(cache.current[tabKey]!);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setCards([]);

    const config = TAB_CONFIG[tabKey];
    const qs = new URLSearchParams({ sort_by: config.sort_by, limit: "200" });
    if (config.slug) qs.set("slug", config.slug);
    if (config.free_cards) qs.set("free_cards", config.free_cards);

    authManager
      .makeAuthenticatedRequest(`/api/proxy/cardgenius/cards?${qs}`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        const raw = parseRawCards(data);
        const curated = curateCards(raw, CURATED_ALIASES[tabKey]);
        cache.current[tabKey] = curated;
        setCards(curated);
      })
      .catch(() => setError(`Failed to load ${TAB_CONFIG[tabKey].label}.`))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCardsForTab("picks"); }, []); // eslint-disable-line

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3A49D6] mb-2">Curated for you</p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Top credit cards
          </h2>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0">
          {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); fetchCardsForTab(key); }}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-[#3A49D6] text-white shadow-lg shadow-indigo-500/25"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              {TAB_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 gap-4">
            <p className="text-slate-400 text-sm">{error}</p>
            <button onClick={() => fetchCardsForTab(activeTab)} className="px-6 py-2.5 rounded-full bg-[#3A49D6] text-white text-sm font-semibold hover:bg-[#2C3CE3] transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && cards.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card, i) => (
              <CardTile key={card.alias || card.name} card={card} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && cards.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">No cards found.</div>
        )}
      </div>
    </section>
  );
}

// ── Tool Card ────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    title: "Card Genius",
    desc: "AI matches your spending to the perfect card in 60 seconds",
    href: "/card-genius",
    icon: Sparkles,
    gradient: "from-[#3A49D6] to-[#6366F1]",
  },
  {
    title: "Beat My Card",
    desc: "Find a card that outperforms the one in your wallet",
    href: "/beat-my-card",
    icon: TrendingUp,
    gradient: "from-[#0EA5E9] to-[#3A49D6]",
  },
  {
    title: "Category Genius",
    desc: "Best card for fuel, travel, dining — any spending category",
    href: "/card-genius-category",
    icon: LayoutGrid,
    gradient: "from-[#8B5CF6] to-[#3A49D6]",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
const HomeLanding = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    router.push(query.trim() ? `/cards?q=${encodeURIComponent(query.trim())}` : "/cards");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-44 pb-16 sm:pb-24 lg:pb-32">
          {/* Layered gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#EEF0FF] via-[#F6F7FF] to-white" />
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] rounded-full bg-[#3A49D6]/[0.06] blur-[120px] pointer-events-none" />
          <div className="absolute top-[-100px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[#38BDF8]/[0.08] blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-[-100px] w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.04] blur-[80px] pointer-events-none" />

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, #3A49D6 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-[#3A49D6]/[0.15] shadow-sm mb-7 sm:mb-9">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3A49D6] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-[#3A49D6]">
                AI-Powered Card Advisor
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[2.75rem] sm:text-[4rem] lg:text-[5.5rem] font-extrabold text-slate-900 leading-[0.92] tracking-tight mb-6 sm:mb-7">
              Build wealth with
              <br />
              <span className="bg-gradient-to-r from-[#3A49D6] via-[#5B6CF0] to-[#38BDF8] bg-clip-text text-transparent">
                smarter cards
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-9 sm:mb-11">
              AI-powered recommendations across 130+ credit cards.
              No bias, no spam — just the right card for how you spend.
            </p>

            {/* Search */}
            <div className="w-full max-w-2xl mx-auto mb-5">
              <div className="flex items-center bg-white rounded-2xl shadow-xl shadow-indigo-500/[0.08] border border-slate-200/80 p-1.5 sm:p-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-300" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search by card name or bank..."
                    className="w-full pl-12 sm:pl-14 pr-2 h-12 sm:h-14 text-sm sm:text-base text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-10 sm:h-12 px-5 sm:px-8 rounded-xl bg-[#3A49D6] text-white text-sm sm:text-base font-semibold hover:bg-[#2C3CE3] active:scale-[0.97] transition-all flex-shrink-0 shadow-lg shadow-indigo-500/25"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
              <Link to="/cards" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-200 text-[13px] font-medium text-slate-600 hover:border-[#3A49D6] hover:text-[#3A49D6] hover:bg-white transition-all bg-white/70 backdrop-blur">
                Explore 130+ cards <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link to="/card-genius" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#3A49D6]/[0.08] border border-[#3A49D6]/[0.15] text-[13px] font-semibold text-[#3A49D6] hover:bg-[#3A49D6]/[0.14] transition-all">
                <Sparkles className="w-3.5 h-3.5" /> AI Card Genius
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>130+ cards analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3A49D6]" />
                <span>Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span>100% free to use</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <section className="relative -mt-2 sm:-mt-4 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-1 bg-slate-900 rounded-2xl p-1 overflow-hidden">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center py-4 sm:py-5">
                  <s.icon className="w-4 h-4 text-[#38BDF8] mb-1.5 hidden sm:block" />
                  <span className="font-display text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-none">
                    {s.value}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-medium tracking-wider uppercase text-slate-400 mt-1">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tools — Horizontal scroll cards ── */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6 sm:mb-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3A49D6] mb-2">Smart Tools</p>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  AI-powered toolkit
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="group relative rounded-2xl p-6 sm:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-100`} />
                  {/* Noise texture */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                  }} />

                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      <tool.icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-1.5">{tool.title}</h3>
                    <p className="text-sm text-white/75 leading-relaxed mb-4">{tool.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white group-hover:gap-2.5 transition-all">
                      Try now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-12 sm:py-20 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3A49D6] mb-2">How it works</p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Three steps to your ideal card
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-14 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-[#3A49D6]/20 to-transparent pointer-events-none" />

              {[
                { num: "01", title: "Share your spend", body: "60-second quiz across categories. No login required.", icon: Zap, color: "bg-indigo-50 text-[#3A49D6]" },
                { num: "02", title: "AI does the work", body: "Our engine cross-references rewards, fees, and your habits.", icon: Sparkles, color: "bg-violet-50 text-violet-600" },
                { num: "03", title: "Get matched", body: "Personalized picks with savings forecast. Apply directly.", icon: CreditCard, color: "bg-cyan-50 text-cyan-600" },
              ].map((step) => (
                <div key={step.num} className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <span className="font-display text-6xl sm:text-7xl font-bold text-slate-100 absolute top-4 right-6 leading-none select-none pointer-events-none">
                    {step.num}
                  </span>
                  <div className={`w-11 h-11 rounded-xl ${step.color} flex items-center justify-center mb-4 relative z-10`}>
                    <step.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-2 relative z-10">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed relative z-10">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bank Trust Strip ── */}
        <section className="py-10 sm:py-14 overflow-hidden border-y border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mb-6 text-center">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Cards from India's leading banks
            </p>
          </div>
          <div className="lp-marquee-mask overflow-hidden">
            <div className="lp-marquee-track">
              {[
                "HDFC Bank", "Axis Bank", "ICICI Bank", "SBI Card", "American Express",
                "Standard Chartered", "Kotak", "IDFC First", "RBL Bank", "Yes Bank",
                "HDFC Bank", "Axis Bank", "ICICI Bank", "SBI Card", "American Express",
                "Standard Chartered", "Kotak", "IDFC First", "RBL Bank", "Yes Bank",
              ].map((bank, i) => (
                <div key={i} className="flex-shrink-0 font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-200 hover:text-[#3A49D6] transition-colors whitespace-nowrap">
                  {bank}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Curated Picks ── */}
        <CuratedPicks />

        {/* ── CTA Banner ── */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16">
              {/* Dark gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1a1a2e] to-[#16213e]" />
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              }} />
              {/* Glow */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#3A49D6]/20 blur-[80px] pointer-events-none" />

              <div className="relative z-10 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-300">Ready to start?</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                  Find your perfect card
                  <br />
                  <span className="text-[#38BDF8]">in 60 seconds</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8 max-w-md">
                  Personalized recommendations. No spam, no bias. Just the right card for your wallet.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/card-genius"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3A49D6] text-white text-sm font-semibold hover:bg-[#2C3CE3] active:scale-[0.97] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Card Genius
                  </Link>
                  <Link
                    to="/cards"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                  >
                    Browse all cards
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomeLanding;
