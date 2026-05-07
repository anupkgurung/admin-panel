export function UnknownSection({
  componentKey,
  themeKey,
}: {
  componentKey: string;
  themeKey: string;
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return (
    <div className="my-4 rounded border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-medium">Unknown component in registry</p>
      <p className="mt-1">
        theme: <code className="font-mono">{themeKey}</code>, component:{" "}
        <code className="font-mono">{componentKey}</code>
      </p>
    </div>
  );
}
