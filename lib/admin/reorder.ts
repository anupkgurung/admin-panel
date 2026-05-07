import { prisma } from "@/lib/db";

/**
 * Computes the fractional rank that a section should move to when the admin
 * presses the up (`-1`) or down (`1`) arrow.
 *
 * Strategy: read the immediate neighbor in the move direction and (if it
 * exists) the section beyond it; place the moved section at the midpoint of
 * those two orders. At the edge (no neighbor-of-neighbor) we step past the
 * neighbor by ±1.0 so subsequent moves still have headroom.
 *
 * Returns `null` when the section is already at the edge (no neighbor in the
 * requested direction) so the caller can no-op.
 */
export async function computeReorderTargetOrder({
  pageId,
  currentOrder,
  direction,
}: {
  pageId: string;
  currentOrder: number;
  direction: -1 | 1;
}): Promise<number | null> {
  if (direction === -1) {
    const prev = await prisma.pageSection.findFirst({
      where: { pageId, order: { lt: currentOrder } },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    if (!prev) return null;

    const prevPrev = await prisma.pageSection.findFirst({
      where: { pageId, order: { lt: prev.order } },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    if (prevPrev) {
      return (prevPrev.order + prev.order) / 2;
    }
    return prev.order - 1;
  }

  const next = await prisma.pageSection.findFirst({
    where: { pageId, order: { gt: currentOrder } },
    orderBy: { order: "asc" },
    select: { order: true },
  });
  if (!next) return null;

  const nextNext = await prisma.pageSection.findFirst({
    where: { pageId, order: { gt: next.order } },
    orderBy: { order: "asc" },
    select: { order: true },
  });
  if (nextNext) {
    return (next.order + nextNext.order) / 2;
  }
  return next.order + 1;
}
