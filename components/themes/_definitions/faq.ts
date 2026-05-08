/**
 * FAQ component definition. See hero.ts for the layout convention.
 */
export const faqDefinition = {
  key: "faq",
  name: "FAQ",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "FAQ",
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      title: { type: "string", default: "FAQs", maxLength: 60 },
      items: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "answer"],
          properties: {
            question: { type: "string", minLength: 1, maxLength: 120 },
            answer: { type: "string", minLength: 1, maxLength: 400 },
          },
        },
      },
    },
  },
} as const;
