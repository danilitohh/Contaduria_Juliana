import type { HTMLAttributes } from "react";
import { cn, humanizeStatus, statusTone } from "@/lib/utils";

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  value: string;
}

export function Badge({ value, className, ...props }: BadgeProps) {
  const tone = statusTone(value);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {humanizeStatus(value)}
    </span>
  );
}
