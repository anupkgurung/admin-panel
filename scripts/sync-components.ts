import { PrismaClient } from "@prisma/client";

import { syncComponentDefinitions } from "@/lib/components/sync";

async function main() {
  const prisma = new PrismaClient();
  try {
    await syncComponentDefinitions(prisma);
    console.log("sync:components - upserted component definitions");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
