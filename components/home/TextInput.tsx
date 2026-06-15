"use client";

import { FieldGroup } from "@/components/home/FieldGroup";

type TextInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  hint?: string;
};

export function TextInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  focused,
  onFocus,
  onBlur,
  hint,
}: TextInputProps) {
  return (
    <FieldGroup id={id} label={label} value={value} focused={focused} hint={hint}>
      <input
        id={id}
        type="text"
        className="field-input"
        placeholder={placeholder}
        value={value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </FieldGroup>
  );
}
