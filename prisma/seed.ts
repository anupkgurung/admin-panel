import { PrismaClient, PageStatus } from "@prisma/client";

import { syncComponentDefinitions } from "../lib/components/sync";

const prisma = new PrismaClient();

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
        spacing: { sectionY: 64 },
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
      allowedComponents: ["hero", "faq"],
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
        spacing: { sectionY: 64 },
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
      allowedComponents: ["hero", "faq"],
    },
  });

  await prisma.theme.upsert({
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
        spacing: { sectionY: 48 },
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
      allowedComponents: ["hero", "faq"],
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
        spacing: { sectionY: 48 },
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
      allowedComponents: ["hero", "faq"],
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

  const home = await prisma.page.upsert({
    where: { themeId_slug: { themeId: modern.id, slug: "/" } },
    update: {
      title: "Home",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
    create: {
      themeId: modern.id,
      slug: "/",
      title: "Home",
      status: PageStatus.published,
      publishedAt: new Date(),
    },
  });

  await prisma.pageSection.upsert({
    where: {
      pageId_instanceKey: { pageId: home.id, instanceKey: "hero_main" },
    },
    update: {
      componentDefinitionId: hero.id,
      order: 10,
      enabled: true,
      props: {
        variant: "split",
        headline: "Build landing pages in minutes",
        subheadline: "Schema-driven sections with theme tokens.",
        cta: { label: "Get started", href: "/signup", style: "primary" },
      },
    },
    create: {
      pageId: home.id,
      componentDefinitionId: hero.id,
      order: 10,
      enabled: true,
      instanceKey: "hero_main",
      props: {
        variant: "split",
        headline: "Build landing pages in minutes",
        subheadline: "Schema-driven sections with theme tokens.",
        cta: { label: "Get started", href: "/signup", style: "primary" },
      },
    },
  });

  await prisma.pageSection.upsert({
    where: {
      pageId_instanceKey: { pageId: home.id, instanceKey: "faq_general" },
    },
    update: {
      componentDefinitionId: faq.id,
      order: 40,
      enabled: true,
      props: {
        title: "Common questions",
        items: [
          {
            question: "Do you store HTML?",
            answer:
              "No. We store structure + props and render React on the server.",
          },
          {
            question: "Can I reorder sections?",
            answer: "Yes. Reordering updates the order column.",
          },
        ],
      },
    },
    create: {
      pageId: home.id,
      componentDefinitionId: faq.id,
      order: 40,
      enabled: true,
      instanceKey: "faq_general",
      props: {
        title: "Common questions",
        items: [
          {
            question: "Do you store HTML?",
            answer:
              "No. We store structure + props and render React on the server.",
          },
          {
            question: "Can I reorder sections?",
            answer: "Yes. Reordering updates the order column.",
          },
        ],
      },
    },
  });

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

  async function upsertBoldSection(
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

  await upsertBoldSection(boldHome.id, "nav_main", navHeader.id, 10, boldNavProps);
  await upsertBoldSection(boldHome.id, "hero_apex", hero.id, 20, {
    variant: "split",
    headline: "SHIP EXPERIENCES THAT FEEL ALIVE",
    subheadline:
      "Dark canvas, electric accents, and cinematic spacing — same sections, bold-first presentation.",
    cta: { label: "Start building", href: "/signup", style: "primary" },
  });
  await upsertBoldSection(boldHome.id, "logos_trust", logosStrip.id, 30, {
    title: "Trusted by product-led teams",
    grayscale: true,
    logos: boldLogoUrls,
  });
  await upsertBoldSection(boldHome.id, "features_core", featureGrid.id, 40, {
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
  await upsertBoldSection(boldHome.id, "cta_mid", ctaBanner.id, 50, {
    headline: "Ready to see your content in Bold?",
    subheadline: "Switch the active theme in admin — each theme keeps its own page tree.",
    align: "center",
    primaryCta: { label: "Open admin", href: "/admin/pages" },
    secondaryCta: { label: "View pricing", href: "/pricing" },
  });
  await upsertBoldSection(boldHome.id, "social_proof", testimonials.id, 60, {
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
  await upsertBoldSection(boldHome.id, "pricing_preview", pricingTable.id, 70, {
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
  await upsertBoldSection(boldHome.id, "faq_home", faq.id, 80, {
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
  await upsertBoldSection(boldHome.id, "footer_main", footer.id, 90, boldFooterProps);

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

  await upsertBoldSection(boldPricingPage.id, "nav_pricing", navHeader.id, 10, boldNavProps);
  await upsertBoldSection(boldPricingPage.id, "hero_pricing", hero.id, 20, {
    variant: "centered",
    headline: "PRICING THAT MATCHES YOUR MOMENTUM",
    subheadline:
      "Transparent tiers on a dark canvas — inverse CTAs and lifted cards keep focus on conversion.",
    cta: { label: "Compare plans", href: "#plans", style: "primary" },
  });
  await upsertBoldSection(boldPricingPage.id, "pricing_full", pricingTable.id, 30, {
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
  await upsertBoldSection(boldPricingPage.id, "faq_pricing", faq.id, 40, {
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
  await upsertBoldSection(boldPricingPage.id, "cta_pricing", ctaBanner.id, 50, {
    headline: "Still deciding?",
    subheadline: "Spin up a Bold sandbox page and compare side-by-side with Minimal.",
    align: "center",
    primaryCta: { label: "Create page", href: "/admin/pages" },
    secondaryCta: { label: "Back home", href: "/" },
  });
  await upsertBoldSection(boldPricingPage.id, "footer_pricing", footer.id, 60, boldFooterProps);

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

  await upsertBoldSection(boldProductPage.id, "nav_product", navHeader.id, 10, boldNavProps);
  await upsertBoldSection(boldProductPage.id, "hero_product", hero.id, 20, {
    variant: "split",
    headline: "ONE STACK FOR CONTENT & EXPERIENCE",
    subheadline:
      "Compose pages from validated sections. Bold theme applies cinematic typography and banded surfaces.",
    cta: { label: "See pricing", href: "/pricing", style: "primary" },
  });
  await upsertBoldSection(boldProductPage.id, "features_product", featureGrid.id, 30, {
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
  await upsertBoldSection(boldProductPage.id, "testimonials_product", testimonials.id, 40, {
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
  await upsertBoldSection(boldProductPage.id, "cta_product", ctaBanner.id, 50, {
    headline: "Put Bold in front of your next cohort",
    subheadline: "Duplicate flows across themes when you're ready to A/B the vibe.",
    align: "left",
    primaryCta: { label: "Book intro", href: "/company" },
    secondaryCta: { label: "Pricing", href: "/pricing" },
  });
  await upsertBoldSection(boldProductPage.id, "footer_product", footer.id, 60, boldFooterProps);

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

  await upsertBoldSection(boldCompanyPage.id, "nav_company", navHeader.id, 10, boldNavProps);
  await upsertBoldSection(boldCompanyPage.id, "hero_company", hero.id, 20, {
    variant: "centered",
    headline: "WE BUILD TOOLS FOR BOLD LAUNCHES",
    subheadline:
      "Remote-first, design-partnered, and obsessed with delightful defaults across themes.",
    cta: { label: "Meet the stack", href: "/product", style: "primary" },
  });
  await upsertBoldSection(boldCompanyPage.id, "values_grid", featureGrid.id, 30, {
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
  await upsertBoldSection(boldCompanyPage.id, "logos_partners", logosStrip.id, 40, {
    title: "Partners & friends",
    grayscale: false,
    logos: boldLogoUrls,
  });
  await upsertBoldSection(boldCompanyPage.id, "testimonials_company", testimonials.id, 50, {
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
  await upsertBoldSection(boldCompanyPage.id, "faq_company", faq.id, 60, {
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
  await upsertBoldSection(boldCompanyPage.id, "footer_company", footer.id, 70, boldFooterProps);

  console.log(
    "Seed complete: themes, components, site settings, modern home, bold pages (/ /pricing /product /company).",
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
