import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PreviewHome() {
  const settings = await prisma.siteSettings.findFirst({
    include: { activeTheme: true },
  });

  const home = settings
    ? await prisma.page.findFirst({
        where: { slug: "/", themeId: settings.activeThemeId },
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: { componentDefinition: true },
          },
        },
      })
    : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Preview: seeded data</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Site settings</h2>
        <pre className="mt-2 overflow-auto rounded bg-gray-50 p-4 text-xs">
          {JSON.stringify(
            settings
              ? {
                  siteName: settings.siteName,
                  activeTheme: {
                    key: settings.activeTheme.key,
                    name: settings.activeTheme.name,
                    allowedComponents: settings.activeTheme.allowedComponents,
                  },
                }
              : null,
            null,
            2,
          )}
        </pre>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Home page</h2>
        {!home ? (
          <p className="mt-2 text-sm text-gray-600">No home page seeded.</p>
        ) : (
          <pre className="mt-2 overflow-auto rounded bg-gray-50 p-4 text-xs">
            {JSON.stringify(
              {
                slug: home.slug,
                title: home.title,
                status: home.status,
                sections: home.sections.map((s) => ({
                  componentKey: s.componentDefinition.key,
                  order: s.order,
                  enabled: s.enabled,
                  instanceKey: s.instanceKey,
                  props: s.props,
                })),
              },
              null,
              2,
            )}
          </pre>
        )}
      </section>
    </main>
  );
}
