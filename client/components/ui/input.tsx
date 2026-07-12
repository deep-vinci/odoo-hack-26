"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState, type ComponentProps } from "react";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", disabled, ...props }: ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const input = (
    <input
      type={isPassword && showPassword ? "text" : type}
      disabled={disabled}
      className={cn(design.input, isPassword && "pr-10", className)}
      {...props}
    />
  );

  if (!isPassword) {
    return input;
  }

  return (
    <div className="relative">
      {input}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowPassword((visible) => !visible)}
        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export { Input };
