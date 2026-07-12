import type { ComponentProps } from "react";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";

type LabelProps = ComponentProps<"label"> & {
  required?: boolean;
};

function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label className={cn(design.label, className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </label>
  );
}

export { Label };
