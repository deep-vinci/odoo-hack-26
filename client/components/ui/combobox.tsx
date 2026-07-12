"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { design } from "@/lib/design";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  id?: string;
  placeholder?: string;
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  noOptionsMessage?: string;
  className?: string;
};

export function Combobox({
  id,
  placeholder = "Select…",
  value,
  options,
  onChange,
  disabled = false,
  noOptionsMessage = "No results found",
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  function openDropdown() {
    if (disabled) return;
    const idx = filtered.findIndex((o) => o.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function select(option: ComboboxOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setHighlightedIndex(0);
    setOpen(true);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightedIndex]) select(filtered[highlightedIndex]);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        setQuery("");
        break;
    }
  }

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlightedIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          value={open ? query : selectedLabel}
          onChange={handleInputChange}
          onMouseDown={openDropdown}
          onFocus={openDropdown}
          onKeyDown={handleKeyDown}
          placeholder={selectedLabel || placeholder}
          className={cn(design.input, "pr-8")}
        />
        <CaretDown
          size={14}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
          {filtered.length === 0 ? (
            <div className="flex h-10 items-center px-3 text-sm text-gray-400">
              {noOptionsMessage}
            </div>
          ) : (
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-[240px] overflow-y-auto p-1"
            >
              {filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={option.value || index}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-2 rounded-[4px] px-3 text-sm transition-colors",
                      isHighlighted
                        ? "bg-[#fafafa] text-[#1f2430]"
                        : "text-[#1f2430]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex-1 truncate",
                        isSelected && "font-medium",
                      )}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check
                        size={14}
                        weight="bold"
                        className="shrink-0 text-[#1f2430]"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
