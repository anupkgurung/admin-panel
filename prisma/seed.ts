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

  // Component definitions (key/name/schema) are sourced from the co-located
  // files in components/themes/_definitions/* via syncComponentDefinitions.
  await syncComponentDefinitions(prisma);

  const hero = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "hero" },
  });
  const faq = await prisma.componentDefinition.findUniqueOrThrow({
    where: { key: "faq" },
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

  console.log("Seed complete: themes, components, site settings, home page.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
