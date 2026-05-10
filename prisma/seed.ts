import { PrismaClient, PageStatus } from "@prisma/client";

import { syncComponentDefinitions } from "../lib/components/sync";

const prisma = new PrismaClient();

/** Populates DB metadata; runtime allowlist uses registry `componentDefinitionKeys`. */
const FULL_ALLOWED_COMPONENTS = [
  "hero",
  "faq",
  "nav_header",
  "feature_grid",
  "cta_banner",
  "testimonials",
  "pricing_table",
  "logos_strip",
  "footer",
];

async function main() {
  const modern = await prisma.theme.upsert({
    where: { key: "modern" },
    update: {
      name: "Modern",
      tokens: {
        colors: {
          primary: "#2F6BFF",
          text: "#111827",
          bg: "#FFFFFF",
          mutedText: "#6B7280",
        },
        radius: { sm: 8, md: 12 },
        spacing: { sectionY: 72 },
        sectionUi: {
          hero: {
            headlinePreset: "prominent",
            container: "wide",
            ctaVariant: "filled",
            sectionBorderBottom: false,
          },
          faq: {
            presentation: "cards",
            titlePreset: "bold",
          },
        },
      },
      // The DB column is now unused at runtime (allowlist comes from the
      // in-code registry) but we keep it populated so older code paths and
      // ad-hoc DB inspection still see something coherent.
      allowedComponents: [...FULL_ALLOWED_COMPONENTS],
    },
    create: {
      key: "modern",
      name: "Modern",
      tokens: {
        colors: {
          primary: "#2F6BFF",
          text: "#111827",
          bg: "#FFFFFF",
          mutedText: "#6B7280",
        },
        radius: { sm: 8, md: 12 },
        spacing: { sectionY: 72 },
        sectionUi: {
          hero: {
            headlinePreset: "prominent",
            container: "wide",
            ctaVariant: "filled",
            sectionBorderBottom: false,
          },
          faq: {
            presentation: "cards",
            titlePreset: "bold",
          },
        },
      },
      allowedComponents: [...FULL_ALLOWED_COMPONENTS],
    },
  });

  const minimal = await prisma.theme.upsert({
    where: { key: "minimal" },
    update: {
      name: "Minimal",
      tokens: {
        colors: {
          primary: "#111827",
          text: "#111827",
          bg: "#FAFAFA",
          mutedText: "#6B7280",
        },
        radius: { sm: 4, md: 6 },
        spacing: { sectionY: 56 },
        sectionUi: {
          hero: {
            headlinePreset: "subtle",
            container: "narrow",
            ctaVariant: "outline",
            sectionBorderBottom: true,
          },
          faq: {
            presentation: "minimal-list",
            titlePreset: "minimal",
          },
        },
      },
      allowedComponents: [...FULL_ALLOWED_COMPONENTS],
    },
    create: {
      key: "minimal",
      name: "Minimal",
      tokens: {
        colors: {
          primary: "#111827",
          text: "#111827",
          bg: "#FAFAFA",
          mutedText: "#6B7280",
        },
        radius: { sm: 4, md: 6 },
        spacing: { sectionY: 56 },
        sectionUi: {
          hero: {
            headlinePreset: "subtle",
            container: "narrow",
            ctaVariant: "outline",
            sectionBorderBottom: true,
          },
          faq: {
            presentation: "minimal-list",
            titlePreset: "minimal",
          },
        },
      },
      allowedComponents: [...FULL_ALLOWED_COMPONENTS],
    },
  });

  const bold = await prisma.theme.upsert({
    where: { key: "bold" },
    update: {
      name: "Bold",
      tokens: {
        colors: {
          primary: "#F97316",
          text: "#F8FAFC",
          bg: "#0B1220",
          mutedText: "#94A3B8",
        },
        radius: { sm: 6, md: 16 },
        spacing: { sectionY: 72 },
        sectionUi: {
          hero: {
            headlinePreset: "dramatic",
            container: "wide",
            ctaVariant: "filled",
            sectionBorderBottom: false,
            surface: "primary-band",
          },
          faq: {
            presentation: "accent-strip",
            titlePreset: "bold",
          },
          marketing: {
            navBar: "bold-strip",
            featureGrid: "lifted",
            ctaBanner: "inverse-band",
            testimonials: "emphasis",
            pricing: "striking",
            logosStrip: "dark-band",
            footer: "inverted-band",
          },
        },
      },
      allowedComponents: [
        "hero",
        "faq",
        "nav_header",
        "feature_grid",
        "cta_banner",
        "testimonials",
        "pricing_table",
        "logos_strip",
        "footer",
      ],
    },
    create: {
      key: "bold",
      name: "Bold",
      tokens: {
        colors: {
          primary: "#F97316",
          text: "#F8FAFC",
          bg: "#0B1220",
          mutedText: "#94A3B8",
        },
        radius: { sm: 6, md: 16 },
        spacing: { sectionY: 72 },
        sectionUi: {
          hero: {
            headlinePreset: "dramatic",
            container: "wide",
            ctaVariant: "filled",
            sectionBorderBottom: false,
            surface: "primary-band",
          },
          faq: {
            presentation: "accent-strip",
            titlePreset: "bold",
          },
          marketing: {
            navBar: "bold-strip",
            featureGrid: "lifted",
            ctaBanner: "inverse-band",
            testimonials: "emphasis",
            pricing: "striking",
            logosStrip: "dark-band",
            footer: "inverted-band",
          },
        },
      },
      allowedComponents: [
        "hero",
        "faq",
        "nav_header",
        "feature_grid",
        "cta_banner",
        "testimonials",
        "pricing_table",
        "logos_strip",
        "footer",
      ],
    },
  });

  // Component definitions (key/name/schema) are sourced from the co-located
  // files in components/themes/_definitions/* via syncComponentDefinitions.
  await syncComponentDefinitions(prisma);

  const hero = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "hero" },
  });
  const faq = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "faq" },
  });
  const navHeader = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "nav_header" },
  });
  const featureGrid = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "feature_grid" },
  });
  const ctaBanner = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "cta_banner" },
  });
  const testimonials = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "testimonials" },
  });
  const pricingTable = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "pricing_table" },
  });
  const logosStrip = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "logos_strip" },
  });
  const footer = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "footer" },
  });

  await prisma.page.deleteMany({
    where: { themeId: { in: [modern.id, minimal.id] } },
  });

  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteName: "My Website",
        activeThemeId: modern.id,
      },
    });
  } else {
    await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: { activeThemeId: modern.id, siteName: "My Website" },
    });
  }

  async function upsertPageSection(
    pageId: string,
    instanceKey: string,
    componentDefinitionId: string,
    order: number,
    props: object,
  ) {
    await prisma.pageSection.upsert({
      where: {
        pageId_instanceKey: { pageId, instanceKey },
      },
      update: {
        componentDefinitionId,
        order,
        enabled: true,
        props,
      },
      create: {
        pageId,
        componentDefinitionId,
        order,
        enabled: true,
        instanceKey,
        props,
      },
    });
  }

  const modernNavProps = {
    variant: "split" as const,
    logo: { text: "StackForge Academy", href: "/" },
    links: [
      { label: "Programs", href: "/programs" },
      { label: "Pricing", href: "/pricing" },
    ],
    cta: { label: "Start learning", href: "/pricing", style: "primary" as const },
    sticky: true,
    showMobileMenu: true,
  };

  const modernFooterProps = {
    brand: {
      name: "StackForge Academy",
      description:
        "Live cohorts for serious builders — ship apps, pass reviews, and grow with a tight community.",
    },
    linkGroups: [
      {
        title: "Learn",
        links: [
          { label: "Programs", href: "/programs" },
          { label: "Pricing", href: "/pricing" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Home", href: "/" },
          { label: "Contact", href: "/pricing" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
    socialLinks: [
      { platform: "GitHub", href: "https://github.com" },
      { platform: "YouTube", href: "https://youtube.com" },
    ],
    copyrightText: "© 2026 StackForge Academy",
  };

  const modernLogoUrls = [
    { name: "Harbor", src: "https://placehold.co/130x36/eef2ff/2563eb/png?text=Harbor" },
    { name: "Vertex", src: "https://placehold.co/130x36/eef2ff/2563eb/png?text=Vertex" },
    { name: "Pulse", src: "https://placehold.co/130x36/eef2ff/2563eb/png?text=Pulse" },
    { name: "Relay", src: "https://placehold.co/130x36/eef2ff/2563eb/png?text=Relay" },
  ];

  const modernHome = await prisma.page.upsert({
    where: { themeId_slug: { themeId: modern.id, slug: "/" } },
    update: {
      title: "StackForge Academy — Home",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: modern.id,
      slug: "/",
      title: "StackForge Academy — Home",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(modernHome.id, "mod_home_nav", navHeader.id, 10, modernNavProps);
  await upsertPageSection(modernHome.id, "mod_home_hero", hero.id, 20, {
    variant: "split",
    headline: "Master full-stack engineering through live cohort builds",
    subheadline:
      "Join builders shipping real products — weekly demos, code reviews, and a curriculum tuned for hire-ready outcomes.",
    cta: { label: "Explore cohorts", href: "/programs", style: "primary" },
  });
  await upsertPageSection(modernHome.id, "mod_home_cta_dual", ctaBanner.id, 30, {
    headline: "Pick your path: browse tracks or compare cohort tuition side by side.",
    subheadline:
      "Every learner starts somewhere — view programs first or jump straight to pricing.",
    align: "center",
    primaryCta: { label: "View programs", href: "/programs" },
    secondaryCta: { label: "See pricing", href: "/pricing" },
  });
  await upsertPageSection(modernHome.id, "mod_home_logos", logosStrip.id, 40, {
    title: "Trusted by teams hiring our graduates",
    grayscale: false,
    logos: modernLogoUrls,
  });
  await upsertPageSection(modernHome.id, "mod_home_stats", featureGrid.id, 50, {
    title: "Momentum in numbers",
    subtitle: "Proof points from our latest cohort cycle.",
    columns: 3,
    items: [
      {
        title: "12k+",
        description: "Learners who completed modules across our partner network.",
        icon: "01",
      },
      {
        title: "94%",
        description: "Report stronger confidence shipping features after capstone.",
        icon: "02",
      },
      {
        title: "48",
        description: "Average mentor touchpoints per learner during the sprint.",
        icon: "03",
      },
    ],
  });
  await upsertPageSection(modernHome.id, "mod_home_pillars", featureGrid.id, 60, {
    title: "Why StackForge feels different",
    subtitle: "Four pillars we refuse to compromise on.",
    columns: 4,
    items: [
      {
        title: "Build-in-public rhythm",
        description: "Weekly demos keep momentum honest — no hiding behind slides.",
        icon: "◎",
      },
      {
        title: "Feedback that ships",
        description: "Reviewers are practitioners; notes translate to merged PRs.",
        icon: "⎘",
      },
      {
        title: "Hiring signal",
        description: "Capstones become portfolio stories recruiters actually read.",
        icon: "★",
      },
      {
        title: "Community accountability",
        description: "Pods match pace — you're never debugging alone at midnight.",
        icon: "⚑",
      },
    ],
  });
  await upsertPageSection(modernHome.id, "mod_home_pricing", pricingTable.id, 70, {
    title: "Featured cohorts",
    subtitle: "Seat counts refresh weekly — highlighted tier includes mentor office hours.",
    billingNote: "Installment plans available at checkout.",
    plans: [
      {
        name: "Evening track",
        price: "$899",
        period: "/cohort",
        highlighted: false,
        features: ["12 weeks live", "Recorded sessions", "Community forum"],
        cta: { label: "Reserve seat", href: "/pricing" },
      },
      {
        name: "Full-time sprint",
        price: "$2.4k",
        period: "/cohort",
        highlighted: true,
        features: ["Daily standups", "1:1 mentor slots", "Career reviews"],
        cta: { label: "Apply now", href: "/pricing" },
      },
      {
        name: "Team license",
        price: "Custom",
        period: "",
        highlighted: false,
        features: ["Private cohort", "Custom syllabus", "Dedicated Slack"],
        cta: { label: "Talk to us", href: "/pricing" },
      },
    ],
  });
  await upsertPageSection(modernHome.id, "mod_home_social", testimonials.id, 80, {
    title: "Graduates shipping in production",
    layout: "carousel",
    items: [
      {
        quote:
          "I traded tutorial loops for real repos — my capstone shipped to users within two weeks of finishing.",
        name: "Elena Voss",
        role: "Software Engineer",
        company: "Brightline",
      },
      {
        quote:
          "The dual track on backend + frontend finally clicked when mentors tied every lecture to a shipping milestone.",
        name: "Marcus Webb",
        role: "Founding Engineer",
        company: "Parcel North",
      },
      {
        quote:
          "Interview loops stopped feeling random once I could narrate architecture decisions from cohort projects.",
        name: "Priya Desai",
        role: "Tech Lead",
        company: "Skyloft",
      },
    ],
  });
  await upsertPageSection(modernHome.id, "mod_home_cta_mid", ctaBanner.id, 90, {
    headline: "Still researching? Compare plans or skim the FAQ — we answer the blunt questions.",
    align: "center",
    primaryCta: { label: "Open pricing", href: "/pricing" },
    secondaryCta: { label: "Browse FAQ below", href: "#faq" },
  });
  await upsertPageSection(modernHome.id, "mod_home_faq", faq.id, 100, {
    title: "Enrollment FAQs",
    items: [
      {
        question: "Do I need a CS degree?",
        answer:
          "No — we screen for grit and fundamentals. A prep kit covers required tooling before day one.",
      },
      {
        question: "Are sessions recorded?",
        answer:
          "Yes — every workshop lands in your cohort library within hours for asynchronous catch-up.",
      },
      {
        question: "Can employers sponsor seats?",
        answer:
          "Absolutely — invoice-ready cohort packs include learner analytics for L&D teams.",
      },
    ],
  });
  await upsertPageSection(modernHome.id, "mod_home_footer", footer.id, 110, modernFooterProps);

  const modernPrograms = await prisma.page.upsert({
    where: { themeId_slug: { themeId: modern.id, slug: "/programs" } },
    update: {
      title: "Programs — StackForge Academy",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: modern.id,
      slug: "/programs",
      title: "Programs — StackForge Academy",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(modernPrograms.id, "mod_prog_nav", navHeader.id, 10, modernNavProps);
  await upsertPageSection(modernPrograms.id, "mod_prog_hero", hero.id, 20, {
    variant: "centered",
    headline: "Programs built around shipping, not passive lectures",
    subheadline:
      "Choose a track — each blends systems thinking, implementation reps, and critique from engineers who still merge code.",
    cta: { label: "Compare tuition", href: "/pricing", style: "primary" },
  });
  await upsertPageSection(modernPrograms.id, "mod_prog_skills", featureGrid.id, 30, {
    title: "What each track emphasizes",
    subtitle: "Expect overlap — every path ends with a portfolio-grade capstone.",
    columns: 3,
    items: [
      {
        title: "Full-stack core",
        description: "Auth, APIs, caching, and pragmatic UI wiring end-to-end.",
        icon: "FS",
      },
      {
        title: "Product polish",
        description: "Instrumentation, accessibility passes, and rollout discipline.",
        icon: "UX",
      },
      {
        title: "Ops readiness",
        description: "CI hooks, observability, and incident-ready logging patterns.",
        icon: "OPS",
      },
      {
        title: "Data literacy",
        description: "Modeling trade-offs and lightweight analytics pipelines.",
        icon: "DATA",
      },
    ],
  });
  await upsertPageSection(modernPrograms.id, "mod_prog_price", pricingTable.id, 40, {
    title: "Compact cohort comparison",
    subtitle: "Jump to the pricing page for stipends and employer bundles.",
    billingNote: "Tuition locks once accepted.",
    plans: [
      {
        name: "Foundations",
        price: "$699",
        period: "",
        highlighted: false,
        features: ["Async labs", "Weekly AMA"],
        cta: { label: "Learn more", href: "/pricing" },
      },
      {
        name: "Accelerated",
        price: "$1.9k",
        period: "",
        highlighted: true,
        features: ["Daily interactions", "Code audits"],
        cta: { label: "Apply", href: "/pricing" },
      },
      {
        name: "Teams",
        price: "Talk",
        period: "",
        highlighted: false,
        features: ["Private mentors", "Custom milestones"],
        cta: { label: "Contact", href: "/pricing" },
      },
    ],
  });
  await upsertPageSection(modernPrograms.id, "mod_prog_faq", faq.id, 50, {
    title: "Program questions",
    items: [
      {
        question: "How large are cohorts?",
        answer: "We cap at ~45 builders so mentors can know every project intimately.",
      },
      {
        question: "Can I switch tracks mid-way?",
        answer:
          "Within the first two weeks — afterwards we optimize for capstone depth inside your chosen arc.",
      },
    ],
  });
  await upsertPageSection(modernPrograms.id, "mod_prog_footer", footer.id, 60, modernFooterProps);

  const modernPricing = await prisma.page.upsert({
    where: { themeId_slug: { themeId: modern.id, slug: "/pricing" } },
    update: {
      title: "Pricing — StackForge Academy",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: modern.id,
      slug: "/pricing",
      title: "Pricing — StackForge Academy",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(modernPricing.id, "mod_price_nav", navHeader.id, 10, modernNavProps);
  await upsertPageSection(modernPricing.id, "mod_price_hero", hero.id, 20, {
    variant: "centered",
    headline: "Transparent tuition with mentor leverage baked in",
    subheadline:
      "Pick the cadence that fits your life — each plan includes async archives and lifetime community access.",
    cta: { label: "Start application", href: "/programs", style: "primary" },
  });
  await upsertPageSection(modernPricing.id, "mod_price_table", pricingTable.id, 30, {
    title: "Compare StackForge plans",
    subtitle: "Highlighted tier unlocks twice-weekly architect reviews.",
    billingNote: "Prices shown in USD.",
    plans: [
      {
        name: "Night school",
        price: "$749",
        period: "/cohort",
        highlighted: false,
        features: ["Async labs", "Forum access", "Monthly AMA"],
        cta: { label: "Choose night school", href: "/signup" },
      },
      {
        name: "Studio cohort",
        price: "$2.6k",
        period: "/cohort",
        highlighted: true,
        features: ["Daily critique blocks", "Career narrative workshop", "Capstone showcase"],
        cta: { label: "Join studio cohort", href: "/signup" },
      },
      {
        name: "Org pods",
        price: "Custom",
        period: "",
        highlighted: false,
        features: ["Private Slack", "Custom syllabus", "Quarterly exec readouts"],
        cta: { label: "Talk sales", href: "/signup" },
      },
    ],
  });
  await upsertPageSection(modernPricing.id, "mod_price_faq", faq.id, 40, {
    title: "Pricing FAQs",
    items: [
      {
        question: "Do you offer refunds?",
        answer:
          "Full refund within seven days if fewer than two live sessions attended — partial credit afterward.",
      },
      {
        question: "Are scholarships available?",
        answer:
          "Yes — needs-based awards open each quarter; details arrive with acceptance emails.",
      },
    ],
  });
  await upsertPageSection(modernPricing.id, "mod_price_cta", ctaBanner.id, 50, {
    headline: "Need a human to sanity-check ROI before you commit?",
    subheadline: "Ping admissions — we reply within one business day with financing options.",
    align: "center",
    primaryCta: { label: "Email admissions", href: "mailto:hello@stackforge.academy" },
    secondaryCta: { label: "Return home", href: "/" },
  });
  await upsertPageSection(modernPricing.id, "mod_price_footer", footer.id, 60, modernFooterProps);

  const minimalNavProps = {
    variant: "simple" as const,
    logo: { text: "Riverbend Press", href: "/" },
    links: [
      { label: "Journal", href: "/journal" },
      { label: "About", href: "/about" },
    ],
    sticky: false,
    showMobileMenu: true,
  };

  const minimalFooterProps = {
    brand: {
      name: "Riverbend Press",
      description:
        "A quiet editorial studio publishing essays, notes, and letters on craft — fewer sections, more whitespace.",
    },
    linkGroups: [
      {
        title: "Pages",
        links: [
          { label: "Journal", href: "/journal" },
          { label: "About", href: "/about" },
        ],
      },
      {
        title: "Elsewhere",
        links: [
          { label: "Newsletter", href: "/journal" },
          { label: "Contact", href: "mailto:letters@riverbend.press" },
        ],
      },
    ],
    socialLinks: [{ platform: "Mastodon", href: "https://mastodon.social" }],
    copyrightText: "© 2026 Riverbend Press",
  };

  const minimalLogoUrls = [
    { name: "Fold", src: "https://placehold.co/130x36/f5f5f5/737373/png?text=Fold" },
    { name: "Grain", src: "https://placehold.co/130x36/f5f5f5/737373/png?text=Grain" },
    { name: "Draft", src: "https://placehold.co/130x36/f5f5f5/737373/png?text=Draft" },
  ];

  const minimalHome = await prisma.page.upsert({
    where: { themeId_slug: { themeId: minimal.id, slug: "/" } },
    update: {
      title: "Riverbend Press",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: minimal.id,
      slug: "/",
      title: "Riverbend Press",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(minimalHome.id, "min_home_nav", navHeader.id, 10, minimalNavProps);
  await upsertPageSection(minimalHome.id, "min_home_hero", hero.id, 20, {
    variant: "centered",
    headline: "Notes on slow publishing and careful sentences",
    subheadline:
      "We release small batches of writing — no funnels, just essays you can sit with.",
    cta: { label: "Read the journal", href: "/journal", style: "primary" },
  });
  await upsertPageSection(minimalHome.id, "min_home_grid", featureGrid.id, 30, {
    title: "What we care about",
    subtitle: "Four commitments that shape every issue.",
    columns: 2,
    items: [
      {
        title: "Signal over hype",
        description: "Long-form interviews with editors and makers who still touch type.",
      },
      {
        title: "Quiet tooling",
        description: "Plain layouts so words stay central — typography does the shouting.",
      },
      {
        title: "Seasonal rhythms",
        description: "We pause between volumes to edit with daylight, not dashboards.",
      },
      {
        title: "Reader letters",
        description: "Replies surface in the journal — dialogue beats anonymous comments.",
      },
    ],
  });
  await upsertPageSection(minimalHome.id, "min_home_quotes", testimonials.id, 40, {
    title: "Readers writing back",
    layout: "cards",
    items: [
      {
        quote:
          "Riverbend reminds me of Sunday supplements — intimate voice, zero tracking pixels.",
        name: "Julian Cho",
        role: "Essayist",
      },
      {
        quote:
          "Each issue feels edited by humans who respect silence between paragraphs.",
        name: "Amelia Frost",
        role: "Librarian",
      },
    ],
  });
  await upsertPageSection(minimalHome.id, "min_home_faq", faq.id, 50, {
    title: "Quiet answers",
    items: [
      {
        question: "How often do you publish?",
        answer: "Roughly monthly — we send a short letter when something is truly ready.",
      },
      {
        question: "Can I contribute?",
        answer:
          "Pitch letters welcome — include three clips and the tension you're chasing.",
      },
    ],
  });
  await upsertPageSection(minimalHome.id, "min_home_footer", footer.id, 60, minimalFooterProps);

  const minimalJournal = await prisma.page.upsert({
    where: { themeId_slug: { themeId: minimal.id, slug: "/journal" } },
    update: {
      title: "Journal — Riverbend Press",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: minimal.id,
      slug: "/journal",
      title: "Journal — Riverbend Press",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(minimalJournal.id, "min_journal_nav", navHeader.id, 10, minimalNavProps);
  await upsertPageSection(minimalJournal.id, "min_journal_hero", hero.id, 20, {
    variant: "split",
    headline: "Field notes from our writers' rooms",
    subheadline:
      "Essays arrive without countdown timers — subscribe mentally for patience.",
    cta: { label: "Subscribe letters", href: "mailto:letters@riverbend.press", style: "primary" },
  });
  await upsertPageSection(minimalJournal.id, "min_journal_stack", featureGrid.id, 30, {
    title: "Recent threads",
    columns: 1,
    items: [
      {
        title: "On trimming introductions",
        description:
          "Why we delete the first page ninety percent of the time — warmth belongs in paragraph four.",
      },
      {
        title: "Analog edits",
        description:
          "Printing drafts mid-week catches rhythm breaks screens gloss over.",
      },
      {
        title: "Letters policy",
        description:
          "We quote subscribers sparingly — consent always precedes publication.",
      },
    ],
  });
  await upsertPageSection(minimalJournal.id, "min_journal_cta", ctaBanner.id, 40, {
    headline: "Want issues delivered calmly?",
    subheadline: "Share your inbox — we send plain text, never promotions disguised as essays.",
    align: "left",
    primaryCta: { label: "Join the list", href: "mailto:letters@riverbend.press" },
    secondaryCta: { label: "Meet the studio", href: "/about" },
  });
  await upsertPageSection(minimalJournal.id, "min_journal_footer", footer.id, 50, minimalFooterProps);

  const minimalAbout = await prisma.page.upsert({
    where: { themeId_slug: { themeId: minimal.id, slug: "/about" } },
    update: {
      title: "About — Riverbend Press",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: minimal.id,
      slug: "/about",
      title: "About — Riverbend Press",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(minimalAbout.id, "min_about_nav", navHeader.id, 10, minimalNavProps);
  await upsertPageSection(minimalAbout.id, "min_about_hero", hero.id, 20, {
    variant: "centered",
    headline: "A tiny editorial desk beside a river",
    subheadline:
      "Founded by former magazine editors who missed tangible pacing — we optimize for re-reading.",
    cta: { label: "Write us", href: "mailto:letters@riverbend.press", style: "primary" },
  });
  await upsertPageSection(minimalAbout.id, "min_about_logos", logosStrip.id, 30, {
    title: "Friends who printed with us",
    grayscale: true,
    logos: minimalLogoUrls,
  });
  await upsertPageSection(minimalAbout.id, "min_about_faq", faq.id, 40, {
    title: "Studio FAQs",
    items: [
      {
        question: "Where are you based?",
        answer:
          "Distributed across Oregon and Nova Scotia — meetings happen walking trails, not boardrooms.",
      },
      {
        question: "Do you run ads?",
        answer:
          "No — sustainability comes from reader memberships and selective collaborations.",
      },
    ],
  });
  await upsertPageSection(minimalAbout.id, "min_about_footer", footer.id, 50, minimalFooterProps);

  const boldNavProps = {
    variant: "split" as const,
    logo: { text: "NovaStack", href: "/" },
    links: [
      { label: "Product", href: "/product" },
      { label: "Pricing", href: "/pricing" },
      { label: "Company", href: "/company" },
    ],
    cta: { label: "Launch demo", href: "/signup", style: "primary" as const },
    sticky: true,
    showMobileMenu: true,
  };

  const boldFooterProps = {
    brand: {
      name: "NovaStack",
      description:
        "High-contrast pages from structured content — styled by the Bold theme.",
    },
    linkGroups: [
      {
        title: "Explore",
        links: [
          { label: "Product", href: "/product" },
          { label: "Pricing", href: "/pricing" },
          { label: "Company", href: "/company" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Docs", href: "/docs" },
          { label: "Support", href: "/support" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
    socialLinks: [
      { platform: "GitHub", href: "https://github.com" },
      { platform: "LinkedIn", href: "https://linkedin.com" },
    ],
    copyrightText: "© 2026 NovaStack · Bold theme showcase",
  };

  const boldLogoUrls = [
    { name: "Vertex", src: "https://placehold.co/130x36/0f172a/F97316/png?text=Vertex" },
    { name: "Pulse", src: "https://placehold.co/130x36/0f172a/F97316/png?text=Pulse" },
    { name: "Orbit", src: "https://placehold.co/130x36/0f172a/F97316/png?text=Orbit" },
    { name: "Forge", src: "https://placehold.co/130x36/0f172a/F97316/png?text=Forge" },
  ];

  // --- Bold theme: 4 published pages showcasing dramatic UI vs modern/minimal ---
  const boldHome = await prisma.page.upsert({
    where: { themeId_slug: { themeId: bold.id, slug: "/" } },
    update: {
      title: "NovaStack — Bold home",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: bold.id,
      slug: "/",
      title: "NovaStack — Bold home",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(boldHome.id, "nav_main", navHeader.id, 10, boldNavProps);
  await upsertPageSection(boldHome.id, "hero_apex", hero.id, 20, {
    variant: "split",
    headline: "SHIP EXPERIENCES THAT FEEL ALIVE",
    subheadline:
      "Dark canvas, electric accents, and cinematic spacing — same sections, bold-first presentation.",
    cta: { label: "Start building", href: "/signup", style: "primary" },
  });
  await upsertPageSection(boldHome.id, "logos_trust", logosStrip.id, 30, {
    title: "Trusted by product-led teams",
    grayscale: true,
    logos: boldLogoUrls,
  });
  await upsertPageSection(boldHome.id, "features_core", featureGrid.id, 40, {
    title: "Everything you need to iterate fast",
    subtitle:
      "Schema-backed sections mean your marketing site stays consistent while design tokens flip the mood.",
    columns: 3,
    items: [
      {
        title: "Theme-native layouts",
        description:
          "Bold strip nav, lifted cards, and inverse CTAs activate only when this theme is live.",
        icon: "◆ Layout",
      },
      {
        title: "One catalog, many skins",
        description:
          "Reuse hero, FAQ, pricing, and more — ComponentDefinition stays shared across themes.",
        icon: "◇ Catalog",
      },
      {
        title: "Publish with guardrails",
        description:
          "Allowlists and validation keep every section honest before it hits production.",
        icon: "✓ Safe",
      },
    ],
  });
  await upsertPageSection(boldHome.id, "cta_mid", ctaBanner.id, 50, {
    headline: "Ready to see your content in Bold?",
    subheadline: "Switch the active theme in admin — each theme keeps its own page tree.",
    align: "center",
    primaryCta: { label: "Open admin", href: "/admin/pages" },
    secondaryCta: { label: "View pricing", href: "/pricing" },
  });
  await upsertPageSection(boldHome.id, "social_proof", testimonials.id, 60, {
    title: "Teams shipping with NovaStack",
    layout: "carousel",
    items: [
      {
        quote:
          "We flipped the site to Bold for launch week — conversion narrative finally matched our product energy.",
        name: "Jordan Lee",
        role: "VP Marketing",
        company: "Brightline",
      },
      {
        quote:
          "Same sections as our minimal theme, totally different vibe. No duplicate React trees to maintain.",
        name: "Priya N.",
        role: "Engineering Lead",
        company: "Northwind",
      },
      {
        quote:
          "Pricing and FAQ blocks finally feel intentional instead of boilerplate.",
        name: "Marcus Cole",
        role: "Founder",
        company: "Relay",
      },
    ],
  });
  await upsertPageSection(boldHome.id, "pricing_preview", pricingTable.id, 70, {
    title: "Plans that scale with you",
    subtitle: "Highlighted tier uses Bold “striking” pricing emphasis.",
    billingNote: "Annual billing saves 20%.",
    plans: [
      {
        name: "Starter",
        price: "$29",
        period: "/mo",
        highlighted: false,
        features: ["5 pages", "Bold + Modern themes", "Email support"],
        cta: { label: "Choose Starter", href: "/signup" },
      },
      {
        name: "Growth",
        price: "$99",
        period: "/mo",
        highlighted: true,
        features: [
          "Unlimited pages",
          "All themes",
          "Priority support",
          "Audit logs",
        ],
        cta: { label: "Choose Growth", href: "/signup" },
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        highlighted: false,
        features: ["SSO", "SLA", "Dedicated success"],
        cta: { label: "Talk to us", href: "/company" },
      },
    ],
  });
  await upsertPageSection(boldHome.id, "faq_home", faq.id, 80, {
    title: "Bold theme FAQs",
    items: [
      {
        question: "Will Bold change my Modern or Minimal pages?",
        answer:
          "No. Pages belong to a theme. Bold pages live under the Bold theme only; switching themes swaps which tree is public.",
      },
      {
        question: "Do I need new components for Bold?",
        answer:
          "No — Bold reuses the same ComponentDefinition keys. Visual differences come from tokens and optional section UI presets.",
      },
      {
        question: "Can I mix Bold sections with another theme?",
        answer:
          "Per-page sections inherit that page's theme. Use separate pages per theme for distinct UX.",
      },
    ],
  });
  await upsertPageSection(boldHome.id, "footer_main", footer.id, 90, boldFooterProps);

  const boldPricingPage = await prisma.page.upsert({
    where: { themeId_slug: { themeId: bold.id, slug: "/pricing" } },
    update: {
      title: "Pricing — Bold",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: bold.id,
      slug: "/pricing",
      title: "Pricing — Bold",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(boldPricingPage.id, "nav_pricing", navHeader.id, 10, boldNavProps);
  await upsertPageSection(boldPricingPage.id, "hero_pricing", hero.id, 20, {
    variant: "centered",
    headline: "PRICING THAT MATCHES YOUR MOMENTUM",
    subheadline:
      "Transparent tiers on a dark canvas — inverse CTAs and lifted cards keep focus on conversion.",
    cta: { label: "Compare plans", href: "#plans", style: "primary" },
  });
  await upsertPageSection(boldPricingPage.id, "pricing_full", pricingTable.id, 30, {
    title: "Plans",
    subtitle: "Pick the tier that fits your velocity.",
    billingNote: "Prices shown in USD.",
    plans: [
      {
        name: "Starter",
        price: "$29",
        period: "/mo",
        highlighted: false,
        features: ["5 landing pages", "Theme switcher", "Community"],
        cta: { label: "Start", href: "/signup" },
      },
      {
        name: "Growth",
        price: "$99",
        period: "/mo",
        highlighted: true,
        features: ["Unlimited pages", "All themes", "Priority queue"],
        cta: { label: "Go Growth", href: "/signup" },
      },
      {
        name: "Enterprise",
        price: "Let's talk",
        period: "",
        highlighted: false,
        features: ["Custom SLA", "Dedicated support"],
        cta: { label: "Contact", href: "/company" },
      },
    ],
  });
  await upsertPageSection(boldPricingPage.id, "faq_pricing", faq.id, 40, {
    title: "Billing questions",
    items: [
      {
        question: "Can I switch plans later?",
        answer: "Yes — upgrades apply immediately; downgrades align to your billing cycle.",
      },
      {
        question: "Do you offer refunds?",
        answer: "Reach out within 14 days of first payment for a goodwill review.",
      },
    ],
  });
  await upsertPageSection(boldPricingPage.id, "cta_pricing", ctaBanner.id, 50, {
    headline: "Still deciding?",
    subheadline: "Spin up a Bold sandbox page and compare side-by-side with Minimal.",
    align: "center",
    primaryCta: { label: "Create page", href: "/admin/pages" },
    secondaryCta: { label: "Back home", href: "/" },
  });
  await upsertPageSection(boldPricingPage.id, "footer_pricing", footer.id, 60, boldFooterProps);

  const boldProductPage = await prisma.page.upsert({
    where: { themeId_slug: { themeId: bold.id, slug: "/product" } },
    update: {
      title: "Product — Bold",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: bold.id,
      slug: "/product",
      title: "Product — Bold",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(boldProductPage.id, "nav_product", navHeader.id, 10, boldNavProps);
  await upsertPageSection(boldProductPage.id, "hero_product", hero.id, 20, {
    variant: "split",
    headline: "ONE STACK FOR CONTENT & EXPERIENCE",
    subheadline:
      "Compose pages from validated sections. Bold theme applies cinematic typography and banded surfaces.",
    cta: { label: "See pricing", href: "/pricing", style: "primary" },
  });
  await upsertPageSection(boldProductPage.id, "features_product", featureGrid.id, 30, {
    title: "Built for builders",
    subtitle: "Operational clarity without sacrificing visual punch.",
    columns: 3,
    items: [
      {
        title: "Live theme tokens",
        description: "Flip palettes and density without touching section props.",
        icon: "⚡ Tokens",
      },
      {
        title: "Guarded publishes",
        description: "AJV + allowlists block broken payloads before they ship.",
        icon: "🛡 Guard",
      },
      {
        title: "Per-theme routing",
        description: "Each theme owns its URLs — no accidental cross-theme bleed.",
        icon: "↔ Routes",
      },
    ],
  });
  await upsertPageSection(boldProductPage.id, "testimonials_product", testimonials.id, 40, {
    title: "What builders say",
    layout: "cards",
    items: [
      {
        quote:
          "Bold reads premium out of the box — great for launch narratives.",
        name: "Alex Rivera",
        role: "Design Lead",
        company: "Contour",
      },
      {
        quote:
          "We kept the same pricing schema; only the theme changed the hierarchy.",
        name: "Sam Okonkwo",
        role: "PM",
        company: "Parcel",
      },
    ],
  });
  await upsertPageSection(boldProductPage.id, "cta_product", ctaBanner.id, 50, {
    headline: "Put Bold in front of your next cohort",
    subheadline: "Duplicate flows across themes when you're ready to A/B the vibe.",
    align: "left",
    primaryCta: { label: "Book intro", href: "/company" },
    secondaryCta: { label: "Pricing", href: "/pricing" },
  });
  await upsertPageSection(boldProductPage.id, "footer_product", footer.id, 60, boldFooterProps);

  const boldCompanyPage = await prisma.page.upsert({
    where: { themeId_slug: { themeId: bold.id, slug: "/company" } },
    update: {
      title: "Company — Bold",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: bold.id,
      slug: "/company",
      title: "Company — Bold",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await upsertPageSection(boldCompanyPage.id, "nav_company", navHeader.id, 10, boldNavProps);
  await upsertPageSection(boldCompanyPage.id, "hero_company", hero.id, 20, {
    variant: "centered",
    headline: "WE BUILD TOOLS FOR BOLD LAUNCHES",
    subheadline:
      "Remote-first, design-partnered, and obsessed with delightful defaults across themes.",
    cta: { label: "Meet the stack", href: "/product", style: "primary" },
  });
  await upsertPageSection(boldCompanyPage.id, "values_grid", featureGrid.id, 30, {
    title: "Operating principles",
    columns: 2,
    items: [
      {
        title: "Craft over clutter",
        description:
          "Every section has one job. Bold theme amplifies clarity with contrast, not noise.",
        icon: "①",
      },
      {
        title: "Ship safely",
        description:
          "Typed props and theme guards mean fewer surprises when editors iterate.",
        icon: "②",
      },
      {
        title: "Theme as mood",
        description:
          "Minimal whispers, Modern balances, Bold declares — pick the voice per campaign.",
        icon: "③",
      },
      {
        title: "Open seams",
        description:
          "Extend tokens before forking React when you need net-new behaviors.",
        icon: "④",
      },
    ],
  });
  await upsertPageSection(boldCompanyPage.id, "logos_partners", logosStrip.id, 40, {
    title: "Partners & friends",
    grayscale: false,
    logos: boldLogoUrls,
  });
  await upsertPageSection(boldCompanyPage.id, "testimonials_company", testimonials.id, 50, {
    title: "Stories from our orbit",
    layout: "cards",
    items: [
      {
        quote:
          "NovaStack let our marketing team iterate nightly without filing tickets for CSS tweaks.",
        name: "Chris Adebayo",
        role: "CMO",
        company: "Skyloft",
      },
    ],
  });
  await upsertPageSection(boldCompanyPage.id, "faq_company", faq.id, 60, {
    title: "Company FAQs",
    items: [
      {
        question: "Where are you based?",
        answer:
          "Distributed across North America and Europe with quarterly onsite weeks.",
      },
      {
        question: "How do we collaborate?",
        answer:
          "Shared Slack channel, weekly roadmap notes, and schema-first section specs.",
      },
    ],
  });
  await upsertPageSection(boldCompanyPage.id, "footer_company", footer.id, 70, boldFooterProps);

  console.log(
    "Seed complete: themes, components, site settings, modern (/ /programs /pricing), minimal (/ /journal /about), bold (/ /pricing /product /company).",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
