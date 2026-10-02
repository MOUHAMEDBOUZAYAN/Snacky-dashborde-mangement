import { cn } from "@/lib/utils";

export function formatStarScore(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${rounded} ★`;
}

interface StarScoreProps {
  value: number | null | undefined;
  count?: number;
  className?: string;
  emptyLabel?: string;
}

export function StarScore({
  value,
  count,
  className,
  emptyLabel = "—",
}: StarScoreProps) {
  const label = formatStarScore(value);
  if (!label) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {emptyLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular-nums text-amber-800",
        className,
      )}
    >
      {label}
      {count != null ? (
        <span className="font-normal text-muted-foreground">({count})</span>
      ) : null}
    </span>
  );
}
