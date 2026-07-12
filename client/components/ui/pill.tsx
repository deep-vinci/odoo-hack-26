import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        active:      "bg-emerald-600 text-white",
        pending:     "bg-amber-500 text-white",
        error:       "bg-red-600 text-white",
        danger:      "bg-red-500 text-white",
        "error-alt": "bg-red-700 text-white",
        inactive:    "bg-gray-400 text-white",
        draft:       "border border-gray-200 bg-gray-700 text-gray-50",
        live:        "bg-emerald-600 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-white",

        info:           "bg-blue-600 text-white",
        brand:          "bg-[#2C5EAD] text-white",
        "brand-accent": "bg-[#2b7fd3] text-white",
        completed:      "bg-[#2C5EAD] text-white",
        valid:          "bg-emerald-600 text-white",
        invalid:        "bg-red-500 text-white",

        "super-admin": "bg-violet-600 text-white",

        generic:   "bg-gray-200 text-gray-700",
        canteen:   "bg-teal-600 text-white",
        plan:      "bg-orange-500 text-white",
        available: "bg-[#009966] text-white",

        "whatsapp-sent":     "bg-emerald-600 text-white",
        "whatsapp-failed":   "bg-red-600 text-white",
        "whatsapp-skipped":  "bg-sky-500 text-white",
        "whatsapp-not-sent": "bg-slate-400 text-white",
      },
    },
    defaultVariants: {
      variant: "generic",
    },
  },
);

export type PillVariant = NonNullable<VariantProps<typeof pillVariants>["variant"]>;

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {}

export function Pill({ variant, className, ...props }: PillProps) {
  return <span className={cn(pillVariants({ variant }), className)} {...props} />;
}

const statusDotVariants = cva("shrink-0 rounded-full", {
  variants: {
    variant: {
      active:      "bg-emerald-500",
      playing:     "bg-emerald-500",
      free:        "bg-white ring-1 ring-gray-300",
      maintenance: "bg-red-400",
      error:       "bg-red-500",
      pending:     "bg-amber-500",
    },
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
    },
  },
  defaultVariants: {
    variant: "free",
    size: "md",
  },
});

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {}

export function StatusDot({ variant, size, className, ...props }: StatusDotProps) {
  return (
    <span className={cn(statusDotVariants({ variant, size }), className)} {...props} />
  );
}
