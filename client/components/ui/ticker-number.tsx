"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ROLL_DURATION_MS = 650;
const DIGIT_STAGGER_MS = 80;

type TickerNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
  className?: string;
  locale?: string;
  maximumFractionDigits?: number;
};

type DigitToken = { type: "digit"; digit: number; index: number };
type StaticToken = { type: "static"; char: string; index: number };
type Token = DigitToken | StaticToken;

function tokenizeDisplay(
  prefix: string,
  formatted: string,
  suffix: string,
): Token[] {
  const full = `${prefix}${formatted}${suffix}`;
  const tokens: Token[] = [];
  let digitIndex = 0;

  for (let i = 0; i < full.length; i++) {
    const char = full[i];
    if (char !== undefined && char >= "0" && char <= "9") {
      tokens.push({ type: "digit", digit: Number(char), index: digitIndex++ });
    } else if (char !== undefined) {
      tokens.push({ type: "static", char, index: i });
    }
  }

  return tokens;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

function DigitColumn({
  targetDigit,
  animationTick,
  staggerMs,
  instant,
}: {
  targetDigit: number;
  animationTick: number;
  staggerMs: number;
  instant: boolean;
}) {
  const [offset, setOffset] = useState(instant ? targetDigit : 0);
  const [transitionOn, setTransitionOn] = useState(false);

  useEffect(() => {
    if (instant) {
      setOffset(targetDigit);
      setTransitionOn(false);
      return;
    }

    setOffset(0);
    setTransitionOn(false);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let rafId = 0;

    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        setTransitionOn(true);
        setOffset(targetDigit);
      });
    }, staggerMs);

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [targetDigit, animationTick, staggerMs, instant]);

  return (
    <span
      className="inline-block h-[1em] overflow-hidden align-top tabular-nums"
      aria-hidden
    >
      <span
        className={cn(
          "flex flex-col will-change-transform",
          transitionOn && "transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
        style={{
          transform: `translateY(-${offset * 10}%)`,
          transitionDuration: transitionOn ? `${ROLL_DURATION_MS}ms` : undefined,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

export function TickerNumber({
  value,
  prefix = "",
  suffix = "",
  isLoading = false,
  className,
  locale = "en-IN",
  maximumFractionDigits = 0,
}: TickerNumberProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animationTick, setAnimationTick] = useState(0);
  const wasLoading = useRef(isLoading);
  const previousValue = useRef(value);
  const hasAnimated = useRef(false);

  const formatted = useMemo(
    () => value.toLocaleString(locale, { maximumFractionDigits }),
    [value, locale, maximumFractionDigits],
  );

  const tokens = useMemo(
    () => tokenizeDisplay(prefix, formatted, suffix),
    [prefix, formatted, suffix],
  );

  const digitCount = useMemo(
    () => tokens.filter((t): t is DigitToken => t.type === "digit").length,
    [tokens],
  );

  useEffect(() => {
    if (isLoading) {
      wasLoading.current = true;
      return;
    }

    const justFinishedLoading = wasLoading.current;
    const valueChanged = previousValue.current !== value;
    const shouldAnimate =
      !prefersReducedMotion &&
      (justFinishedLoading || valueChanged || !hasAnimated.current);

    if (shouldAnimate) {
      setAnimationTick((tick) => tick + 1);
      hasAnimated.current = true;
    }

    wasLoading.current = false;
    previousValue.current = value;
  }, [value, isLoading, prefersReducedMotion]);

  if (isLoading) {
    return (
      <span className={cn("inline-block text-gray-300", className)} aria-hidden>
        —
      </span>
    );
  }

  const instant = prefersReducedMotion;

  return (
    <span
      className={cn("inline-flex items-baseline tabular-nums", className)}
      aria-label={`${prefix}${formatted}${suffix}`}
    >
      {tokens.map((token) =>
        token.type === "static" ? (
          <span key={`s-${token.index}-${token.char}`}>{token.char}</span>
        ) : (
          <DigitColumn
            key={`d-${token.index}-${animationTick}`}
            targetDigit={token.digit}
            animationTick={animationTick}
            staggerMs={(digitCount - 1 - token.index) * DIGIT_STAGGER_MS}
            instant={instant}
          />
        ),
      )}
    </span>
  );
}
