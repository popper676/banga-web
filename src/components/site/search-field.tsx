"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/icons";

export function SearchField({
  value,
  onChange,
  onSubmit,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      className="max-w-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="dish-search" className="text-[13px] font-semibold text-ink">
        Search dishes, sauces, sets and sides
      </label>

      <div className="mt-1.5 flex gap-2">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-grey"
            aria-hidden
          >
            <Icon name="search" size={20} />
          </span>
          <input
            ref={input}
            id="dish-search"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Try “yangnyeom”, “kimchi” or “under rm20”"
            className="h-14 w-full rounded-[16px] border border-line bg-white pl-12 pr-13 text-[17px] text-ink placeholder:text-grey/70 focus:border-ink"
          />
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClear();
                input.current?.focus();
              }}
              aria-label="Clear the search field"
              className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-grey transition-colors hover:bg-mint hover:text-ink"
            >
              <Icon name="cross" size={18} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex h-14 shrink-0 items-center gap-2 rounded-[16px] border border-ink bg-ink px-5 text-[15px] font-semibold text-white transition-colors hover:bg-deep"
        >
          Search
          <Icon name="arrowRight" size={17} />
        </button>
      </div>
    </form>
  );
}
