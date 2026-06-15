"use client";

import { FieldGroup } from "@/components/home/FieldGroup";

type PromptInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  rows?: number;
  hint?: string;
};

export function PromptInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  focused,
  onFocus,
  onBlur,
  rows = 5,
  hint,
}: PromptInputProps) {
  return (
    <FieldGroup id={id} label={label} value={value} focused={focused} hint={hint}>
      <textarea
        id={id}
        className="field-textarea"
        placeholder={placeholder}
        value={value}
        rows={rows}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </FieldGroup>
  );
}
