import type { PrismaClient } from "@prisma/client";

import { componentDefinitions } from "@/components/themes/_definitions";

/**
 * Upserts every co-located component definition (key, name, schema) into the
 * `component_definitions` table. The DB row is required so that
 * `page_sections.component_definition_id` has something to FK to and so AJV
 * validation in route handlers can read `schema` without importing component
 * code. The source of truth, however, is the in-code definition.
 *
 * Idempotent and safe to run on every boot/seed.
 */
export async function syncComponentDefinitions(client: PrismaClient): Promise<void> {
  for (const def of componentDefinitions) {
    await client.componentDefinition.upsert({
      where: { key: def.key },
      update: { name: def.name, schema: def.schema },
      create: { key: def.key, name: def.name, schema: def.schema },
    });
  }
}
