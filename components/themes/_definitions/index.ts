import { heroDefinition } from "./hero";
import { faqDefinition } from "./faq";
import {
  ctaBannerDefinition,
  featureGridDefinition,
  footerDefinition,
  logosStripDefinition,
  navHeaderDefinition,
  pricingTableDefinition,
  testimonialsDefinition,
} from "./marketing";

export type ComponentDefinitionInput = {
  key: string;
  name: string;
  schema: object;
};

/** All component definitions known to the application code. */
export const componentDefinitions: ComponentDefinitionInput[] = [
  heroDefinition,
  faqDefinition,
  navHeaderDefinition,
  featureGridDefinition,
  ctaBannerDefinition,
  testimonialsDefinition,
  pricingTableDefinition,
  logosStripDefinition,
  footerDefinition,
];

export const componentDefinitionKeys: string[] = componentDefinitions.map(
  (def) => def.key,
);
