'use client';

import { useState, useRef, useEffect, type FC } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterDropdown: FC<FilterDropdownProps> = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded border border-interactive-default bg-bg-base text-text-primary text-[13px] font-extrabold hover:text-text-secondary/80 transition-colors duration-150 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.label}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>

      {/* Dropdown panel*/}
      {open && (
        <div
          className="text-text-primary absolute top-[calc(100%+2px)] right-0 min-w-[8rem] bg-bg-base border border-interactive-default rounded shadow-[0_8px_24px_rgba(0,0,0,0.55)] z-300 overflow-hidden animate-drop-in"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex items-center w-full px-3.5 py-1.5 font-extrabold text-[13px] text-text-primary hover:text-text-secondary/80 transition-colors duration-150 cursor-pointer ${
                option.value === value ? 'opacity-100' : 'opacity-70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};