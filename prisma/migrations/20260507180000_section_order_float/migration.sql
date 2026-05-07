-- Switch page_sections.order from integer to double precision so reorder
-- can be a single UPDATE that sets order to the midpoint between neighbors
-- (fractional rank). Existing integer values cast cleanly.
ALTER TABLE "page_sections"
  ALTER COLUMN "order" TYPE DOUBLE PRECISION USING "order"::double precision;
