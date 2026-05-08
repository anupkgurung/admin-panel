/**
 * Hero component definition. Co-located with the per-theme React components
 * so the JSON Schema, name, and React props live next to each other. The
 * `npm run sync:components` script (and the dev seed) upserts this
 * definition into `component_definitions`.
 */
export const heroDefinition = {
  key: "hero",
  name: "Hero",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Hero",
    type: "object",
    additionalProperties: false,
    required: ["headline", "cta"],
    properties: {
      variant: {
        type: "string",
        enum: ["centered", "split"],
        default: "centered",
      },
      headline: { type: "string", minLength: 1, maxLength: 80 },
      subheadline: { type: "string", maxLength: 180 },
      cta: {
        type: "object",
        additionalProperties: false,
        required: ["label", "href"],
        properties: {
          label: { type: "string", minLength: 1, maxLength: 30 },
          href: { type: "string", minLength: 1 },
          style: {
            type: "string",
            enum: ["primary", "secondary"],
            default: "primary",
          },
        },
      },
    },
  },
} as const;
