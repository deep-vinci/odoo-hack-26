import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[4px] text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fd3]/20 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            size: {
                sm: "h-8 px-3",
                default: "h-9 px-4",
                lg: "h-10 px-4",
                icon: "size-9",
                "icon-sm": "size-8",
            },
            variant: {
                primary:
                    "border border-[#2C5EAD] bg-[#2C5EAD] text-white hover:border-[#244f96] hover:bg-[#244f96]",
                secondary:
                    "border border-gray-200 bg-white text-[#1f2430] hover:bg-gray-100",
                success: "bg-emerald-600 text-white hover:bg-emerald-700",
                danger: "bg-red-600 text-white hover:bg-red-700",
                dark: "bg-[#1b181e] text-white hover:bg-[#2a2630]",
                whatsapp:
                    "border border-gray-200 bg-white text-[#0d7a4c] hover:bg-gray-100",
                ghost: "text-gray-600 hover:bg-gray-100 hover:text-[#1f2430]",
                link: "text-[#2b7fd3] underline-offset-4 hover:text-[#1f6bb8] hover:underline",
                tab: "px-4 py-2 text-gray-600 hover:text-[#1f2430]",
                "tab-detached":
                    "border-[1.5px] border-[#e5e5e5] bg-[#e5e5e5] px-[15px] py-2 leading-5 text-gray-500 transition-all duration-300 hover:border-[#1e264080] hover:bg-white hover:text-black hover:shadow-[0_2px_6px_#1a181e0a]",
            },
            active: {
                true: "",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        compoundVariants: [
            {
                variant: "tab",
                active: true,
                class: "bg-[#1b181e] text-white shadow-[0_1px_2px_rgba(26,24,30,0.12)] hover:text-white",
            },
            {
                variant: "tab-detached",
                active: true,
                class: "border-[#1e264080] bg-white text-[#1a181e] shadow-[0_2px_6px_#1a181e0a]",
            },
        ],
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    },
);

type ButtonProps = ComponentProps<"button"> &
    VariantProps<typeof buttonVariants>;

function Button({
    className,
    variant,
    size,
    active,
    fullWidth,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                buttonVariants({ variant, size, active, fullWidth }),
                className,
            )}
            {...props}
        />
    );
}

export { Button, buttonVariants };
