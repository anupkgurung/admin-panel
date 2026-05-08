/** Hero / FAQ JSON schemas live alongside marketing sections for one catalog file. */
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

export const navHeaderDefinition = {
  key: "nav_header",
  name: "Nav Header",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Nav Header",
    type: "object",
    additionalProperties: false,
    required: ["logo", "links"],
    properties: {
      variant: {
        type: "string",
        enum: ["simple", "centered", "split"],
        default: "simple",
      },
      logo: {
        type: "object",
        additionalProperties: false,
        required: ["text", "href"],
        properties: {
          text: { type: "string", minLength: 1, maxLength: 40 },
          href: { type: "string", minLength: 1 },
        },
      },
      links: {
        type: "array",
        minItems: 1,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "href"],
          properties: {
            label: { type: "string", minLength: 1, maxLength: 40 },
            href: { type: "string", minLength: 1 },
            external: { type: "boolean", default: false },
          },
        },
      },
      cta: {
        type: "object",
        additionalProperties: false,
        required: ["label", "href"],
        properties: {
          label: { type: "string", minLength: 1, maxLength: 30 },
          href: { type: "string", minLength: 1 },
          style: {
            type: "string",
            enum: ["primary", "secondary", "ghost"],
            default: "primary",
          },
        },
      },
      sticky: { type: "boolean", default: false },
      showMobileMenu: { type: "boolean", default: true },
    },
  },
} as const;

export const featureGridDefinition = {
  key: "feature_grid",
  name: "Feature Grid",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Feature Grid",
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      title: { type: "string", maxLength: 80, default: "Features" },
      subtitle: { type: "string", maxLength: 180 },
      columns: { type: "integer", minimum: 1, maximum: 4, default: 3 },
      items: {
        type: "array",
        minItems: 1,
        maxItems: 12,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description"],
          properties: {
            title: { type: "string", minLength: 1, maxLength: 60 },
            description: { type: "string", minLength: 1, maxLength: 220 },
            icon: { type: "string", maxLength: 40 },
          },
        },
      },
    },
  },
} as const;

export const ctaBannerDefinition = {
  key: "cta_banner",
  name: "CTA Banner",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "CTA Banner",
    type: "object",
    additionalProperties: false,
    required: ["headline", "primaryCta"],
    properties: {
      headline: { type: "string", minLength: 1, maxLength: 90 },
      subheadline: { type: "string", maxLength: 180 },
      align: { type: "string", enum: ["left", "center"], default: "center" },
      primaryCta: {
        type: "object",
        additionalProperties: false,
        required: ["label", "href"],
        properties: {
          label: { type: "string", minLength: 1, maxLength: 30 },
          href: { type: "string", minLength: 1 },
        },
      },
      secondaryCta: {
        type: "object",
        additionalProperties: false,
        required: ["label", "href"],
        properties: {
          label: { type: "string", minLength: 1, maxLength: 30 },
          href: { type: "string", minLength: 1 },
        },
      },
    },
  },
} as const;

export const testimonialsDefinition = {
  key: "testimonials",
  name: "Testimonials",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Testimonials",
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      title: { type: "string", maxLength: 80, default: "What customers say" },
      layout: { type: "string", enum: ["cards", "carousel"], default: "cards" },
      items: {
        type: "array",
        minItems: 1,
        maxItems: 12,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["quote", "name"],
          properties: {
            quote: { type: "string", minLength: 1, maxLength: 400 },
            name: { type: "string", minLength: 1, maxLength: 60 },
            role: { type: "string", maxLength: 80 },
            company: { type: "string", maxLength: 80 },
            avatarUrl: { type: "string", maxLength: 500 },
          },
        },
      },
    },
  },
} as const;

export const pricingTableDefinition = {
  key: "pricing_table",
  name: "Pricing Table",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Pricing Table",
    type: "object",
    additionalProperties: false,
    required: ["plans"],
    properties: {
      title: { type: "string", maxLength: 80, default: "Pricing" },
      subtitle: { type: "string", maxLength: 180 },
      billingNote: { type: "string", maxLength: 120 },
      plans: {
        type: "array",
        minItems: 1,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "price", "features", "cta"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 40 },
            price: { type: "string", minLength: 1, maxLength: 30 },
            period: { type: "string", maxLength: 20, default: "/mo" },
            highlighted: { type: "boolean", default: false },
            features: {
              type: "array",
              minItems: 1,
              maxItems: 20,
              items: { type: "string", minLength: 1, maxLength: 120 },
            },
            cta: {
              type: "object",
              additionalProperties: false,
              required: ["label", "href"],
              properties: {
                label: { type: "string", minLength: 1, maxLength: 30 },
                href: { type: "string", minLength: 1 },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const logosStripDefinition = {
  key: "logos_strip",
  name: "Logos Strip",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Logos Strip",
    type: "object",
    additionalProperties: false,
    required: ["logos"],
    properties: {
      title: { type: "string", maxLength: 80, default: "Trusted by" },
      grayscale: { type: "boolean", default: true },
      logos: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "src"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 60 },
            src: { type: "string", minLength: 1, maxLength: 500 },
            href: { type: "string", maxLength: 500 },
          },
        },
      },
    },
  },
} as const;

export const footerDefinition = {
  key: "footer",
  name: "Footer",
  schema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Footer",
    type: "object",
    additionalProperties: false,
    required: ["brand", "linkGroups"],
    properties: {
      brand: {
        type: "object",
        additionalProperties: false,
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 60 },
          description: { type: "string", maxLength: 200 },
        },
      },
      linkGroups: {
        type: "array",
        minItems: 1,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "links"],
          properties: {
            title: { type: "string", minLength: 1, maxLength: 40 },
            links: {
              type: "array",
              minItems: 1,
              maxItems: 12,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["label", "href"],
                properties: {
                  label: { type: "string", minLength: 1, maxLength: 60 },
                  href: { type: "string", minLength: 1, maxLength: 500 },
                },
              },
            },
          },
        },
      },
      socialLinks: {
        type: "array",
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["platform", "href"],
          properties: {
            platform: { type: "string", minLength: 1, maxLength: 30 },
            href: { type: "string", minLength: 1, maxLength: 500 },
          },
        },
      },
      copyrightText: { type: "string", maxLength: 120 },
    },
  },
} as const;
