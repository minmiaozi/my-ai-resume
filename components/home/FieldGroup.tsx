"use client";

import type { ReactNode } from "react";

type FieldGroupProps = {
  id: string;
  label: string;
  value: string;
  focused: boolean;
  children: ReactNode;
  hint?: string;
};

export function FieldGroup({ id, label, value, focused, children, hint }: FieldGroupProps) {
  const groupClass = ["field-group", focused && "focused", value.trim() && "filled"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={groupClass}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className="sr-only" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
