"use client";

import type { KeyboardEvent } from "react";

type IndustryOption = {
  key: string;
  label: string;
};

type IndustrySelectorProps = {
  label: string;
  options: IndustryOption[];
  value: string;
  onChange: (value: string) => void;
};

export function IndustrySelector({
  label,
  options,
  value,
  onChange,
}: IndustrySelectorProps) {
  return (
    <div className="field-group">
      <span className="field-label" id="industry-selector-label">
        {label}
      </span>
      <div
        className="industry-chips"
        role="radiogroup"
        aria-labelledby="industry-selector-label"
      >
        {options.map((item) => (
          <IndustryCard
            key={item.key}
            label={item.label}
            selected={value === item.label}
            onSelect={() => onChange(value === item.label ? "" : item.label)}
          />
        ))}
      </div>
    </div>
  );
}

type IndustryCardProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

function IndustryCard({ label, selected, onSelect }: IndustryCardProps) {
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`industry-chip${selected ? " selected" : ""}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      {label}
    </button>
  );
}
