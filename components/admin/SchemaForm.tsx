"use client";

import { useMemo } from "react";

export type JSONSchema = {
  type?: string | string[];
  title?: string;
  description?: string;
  enum?: Array<string | number>;
  default?: unknown;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
};

type Path = (string | number)[];

function getAtPath(obj: unknown, path: Path): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current == null) return undefined;
    if (typeof key === "number" && Array.isArray(current)) {
      current = current[key];
    } else if (typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[String(key)];
    } else {
      return undefined;
    }
  }
  return current;
}

function setAtPath(obj: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (typeof head === "number") {
    const arr = Array.isArray(obj) ? [...obj] : [];
    arr[head] = setAtPath(arr[head], rest, value);
    return arr;
  }
  const next: Record<string, unknown> =
    obj && typeof obj === "object" && !Array.isArray(obj)
      ? { ...(obj as Record<string, unknown>) }
      : {};
  next[head] = setAtPath(next[head], rest, value);
  return next;
}

function removeAtPath(obj: unknown, path: Path): unknown {
  if (path.length === 0) return undefined;
  const [head, ...rest] = path;
  if (typeof head === "number" && Array.isArray(obj)) {
    if (rest.length === 0) {
      const next = [...obj];
      next.splice(head, 1);
      return next;
    }
    const next = [...obj];
    next[head] = removeAtPath(next[head], rest);
    return next;
  }
  if (typeof head === "string" && obj && typeof obj === "object") {
    const next = { ...(obj as Record<string, unknown>) };
    if (rest.length === 0) {
      delete next[head];
      return next;
    }
    next[head] = removeAtPath(next[head], rest);
    return next;
  }
  return obj;
}

export function SchemaForm({
  schema,
  value,
  onChange,
}: {
  schema: JSONSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  return (
    <FieldNode
      schema={schema}
      value={value}
      label={schema.title}
      path={[]}
      required={false}
      rootValue={value}
      rootOnChange={onChange}
    />
  );
}

function typeOf(schema: JSONSchema): string {
  if (Array.isArray(schema.type)) return schema.type[0];
  return schema.type ?? "object";
}

function FieldNode({
  schema,
  value,
  label,
  path,
  required,
  rootValue,
  rootOnChange,
}: {
  schema: JSONSchema;
  value: unknown;
  label?: string;
  path: Path;
  required: boolean;
  rootValue: unknown;
  rootOnChange: (next: unknown) => void;
}) {
  const updateAt = (relPath: Path, v: unknown) =>
    rootOnChange(setAtPath(rootValue, [...path, ...relPath], v));
  const removeAt = (relPath: Path) =>
    rootOnChange(removeAtPath(rootValue, [...path, ...relPath]));

  if (schema.enum && schema.enum.length > 0) {
    return (
      <Field label={label} required={required}>
        <select
          className="w-full rounded border px-3 py-2 text-sm"
          value={(value as string | number | undefined) ?? ""}
          onChange={(e) => updateAt([], e.target.value)}
        >
          <option value="">—</option>
          {schema.enum.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  const t = typeOf(schema);

  if (t === "string") {
    return (
      <Field label={label} required={required}>
        <input
          type="text"
          className="w-full rounded border px-3 py-2 text-sm"
          value={(value as string | undefined) ?? ""}
          maxLength={schema.maxLength}
          onChange={(e) => updateAt([], e.target.value)}
        />
      </Field>
    );
  }

  if (t === "number" || t === "integer") {
    return (
      <Field label={label} required={required}>
        <input
          type="number"
          className="w-full rounded border px-3 py-2 text-sm"
          value={
            typeof value === "number"
              ? value
              : value === undefined
                ? ""
                : Number(value as string)
          }
          onChange={(e) =>
            updateAt(
              [],
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
        />
      </Field>
    );
  }

  if (t === "boolean") {
    return (
      <Field label={label} required={required}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => updateAt([], e.target.checked)}
        />
      </Field>
    );
  }

  if (t === "object" && schema.properties) {
    const requiredSet = new Set(schema.required ?? []);
    return (
      <fieldset className="rounded border p-3">
        {label ? (
          <legend className="px-1 text-xs font-medium uppercase tracking-wide text-gray-600">
            {label}
          </legend>
        ) : null}
        <div className="space-y-3">
          {Object.entries(schema.properties).map(([propName, propSchema]) => {
            const childValue =
              value && typeof value === "object" && !Array.isArray(value)
                ? (value as Record<string, unknown>)[propName]
                : undefined;
            return (
              <FieldNode
                key={propName}
                schema={propSchema}
                value={childValue}
                label={propSchema.title ?? propName}
                path={[...path, propName]}
                required={requiredSet.has(propName)}
                rootValue={rootValue}
                rootOnChange={rootOnChange}
              />
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (t === "array" && schema.items) {
    const arr = Array.isArray(value) ? (value as unknown[]) : [];
    const itemSchema = schema.items;
    const max = schema.maxItems ?? Infinity;
    return (
      <fieldset className="rounded border p-3">
        {label ? (
          <legend className="px-1 text-xs font-medium uppercase tracking-wide text-gray-600">
            {label} ({arr.length})
          </legend>
        ) : null}
        <div className="space-y-3">
          {arr.map((item, idx) => (
            <div key={idx} className="rounded border bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAt([idx])}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <FieldNode
                schema={itemSchema}
                value={item}
                label={undefined}
                path={[...path, idx]}
                required={false}
                rootValue={rootValue}
                rootOnChange={rootOnChange}
              />
            </div>
          ))}
          {arr.length < max ? (
            <button
              type="button"
              onClick={() =>
                updateAt(
                  [arr.length],
                  itemSchema.type === "object" ? {} : "",
                )
              }
              className="text-sm text-blue-600 hover:underline"
            >
              + Add item
            </button>
          ) : null}
        </div>
      </fieldset>
    );
  }

  return (
    <Field label={label} required={required}>
      <textarea
        className="w-full rounded border px-3 py-2 font-mono text-xs"
        rows={3}
        value={JSON.stringify(value ?? null)}
        onChange={(e) => {
          try {
            updateAt([], JSON.parse(e.target.value));
          } catch {
            /* ignore */
          }
        }}
      />
    </Field>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      {label ? (
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </span>
      ) : null}
      {children}
    </label>
  );
}

export function defaultsForSchema(schema: JSONSchema): unknown {
  if (schema.default !== undefined) return schema.default;
  const t = typeOf(schema);
  if (t === "object" && schema.properties) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(schema.properties)) {
      const d = defaultsForSchema(v);
      if (d !== undefined) out[k] = d;
    }
    return out;
  }
  if (t === "array") return [];
  if (t === "boolean") return false;
  return undefined;
}

// re-export so other code can get path utilities if needed in the future
export const internal = { getAtPath, setAtPath, removeAtPath };
