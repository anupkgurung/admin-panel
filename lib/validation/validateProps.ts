import Ajv, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  strict: false,
  coerceTypes: false,
});
addFormats(ajv);

export type PropValidationError = {
  path: string;
  message: string;
};

export type PropValidationResult =
  | { valid: true; data: unknown }
  | { valid: false; errors: PropValidationError[] };

const compileCache = new WeakMap<object, ReturnType<typeof ajv.compile>>();

function getValidator(schema: object) {
  let v = compileCache.get(schema);
  if (!v) {
    v = ajv.compile(schema);
    compileCache.set(schema, v);
  }
  return v;
}

function formatErrors(errors: ErrorObject[] | null | undefined): PropValidationError[] {
  if (!errors || errors.length === 0) {
    return [{ path: "/", message: "invalid" }];
  }
  return errors.map((e) => ({
    path: e.instancePath || "/",
    message: e.message ?? "invalid",
  }));
}

export function validateProps(
  schema: object,
  data: unknown,
): PropValidationResult {
  const validate = getValidator(schema);
  const dataCopy = JSON.parse(JSON.stringify(data ?? {}));
  const ok = validate(dataCopy);
  if (ok) return { valid: true, data: dataCopy };
  return { valid: false, errors: formatErrors(validate.errors) };
}
