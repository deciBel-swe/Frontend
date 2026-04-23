// app/components/Checkbox.tsx
"use client";

import React from "react";

interface CheckboxProps {
  id: string;
  label: string;
  defaultChecked?: boolean;
}

export default function Checkbox({ id, label, defaultChecked = true }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between pb-2 cursor-pointer"
      data-testid={`checkbox-${id}`} 
    >
      <span className="text-sm text-base">{label}</span>
      <input
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-text-primary cursor-pointer"
        data-testid={`checkbox-input-${id}`} 
      />
    </label>
  );
}
