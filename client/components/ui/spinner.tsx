import { cn } from "@/lib/utils";

type SpinnerProps = {
  label?: string;
  className?: string;
  spinnerClassName?: string;
  textClassName?: string;
};

export function Spinner({
  label,
  className,
  spinnerClassName,
  textClassName,
}: SpinnerProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-gray-500", className)}>
      <span
        className={cn(
          "h-5 w-5 animate-spin rounded-full border-[2.5px] border-gray-300 border-t-[#1b181e]",
          spinnerClassName,
        )}
        aria-hidden="true"
      />
      {label ? <span className={cn("text-sm", textClassName)}>{label}</span> : null}
    </div>
  );
}
