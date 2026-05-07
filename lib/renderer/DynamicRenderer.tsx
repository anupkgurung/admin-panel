import { resolveComponent } from "@/lib/registry";
import { UnknownSection } from "./UnknownSection";

export type RenderableSection = {
  id: string;
  componentKey: string;
  props: Record<string, unknown>;
};

export function DynamicRenderer({
  themeKey,
  sections,
}: {
  themeKey: string;
  sections: RenderableSection[];
}) {
  return (
    <>
      {sections.map((section) => {
        const Component = resolveComponent(themeKey, section.componentKey);
        if (!Component) {
          return (
            <UnknownSection
              key={section.id}
              themeKey={themeKey}
              componentKey={section.componentKey}
            />
          );
        }
        return <Component key={section.id} {...section.props} />;
      })}
    </>
  );
}
