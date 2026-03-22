'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';

/**
 * Represents a single option in a select field
 * @interface FloatingSelectOption
 * @property {string} value - The option's value (what gets submitted)
 * @property {string} label - The displayed text for the option
 * @property {boolean} [disabled] - Whether the option is disabled and cannot be selected
 */
export interface FloatingSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Props for the FloatingSelectField component
 * Extends standard HTML select attributes while customizing value and onChange handling
 * @interface FloatingSelectFieldProps
 * @property {string} label - Floating label text that animates above the select when focused or has a value
 * @property {string} value - Currently selected option value
 * @property {(value: string) => void} onChange - Callback function invoked when selection changes
 * @property {FloatingSelectOption[]} options - Array of available options
 * @property {string} [placeholder] - Placeholder option text (displayed when no value is selected)
 * @property {string} [error] - Optional error message displayed below the select field
 */
interface FloatingSelectFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FloatingSelectOption[];
  placeholder?: string;
  error?: string;
}

/**
 * FloatingSelectField Component
 *
 * A reusable select dropdown field with an animated floating label.
 * The label smoothly animates to the top when the field is focused or has a selected value.
 * Displays validation error messages below the select.
 *
 * Features:
 * - Floating label animation
 * - Optional placeholder option
 * - Support for disabled options
 * - Error state display
 * - Customizable appearance with Tailwind classes
 *
 * @component
 * @param {FloatingSelectFieldProps} props - Component props
 * @returns {JSX.Element} The select field with floating label
 *
 * @example
 * <FloatingSelectField
 *   label="Month"
 *   value={month}
 *   onChange={setMonth}
 *   options={monthOptions}
 *   placeholder="Select a month"
 *   error={monthError}
 * />
 */
const FloatingSelectField: FC<FloatingSelectFieldProps> = ({
  id,
  name,
  disabled,
  required,
  autoFocus,
  onBlur,
  onFocus,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = '',
  ...inputProps
}) => {
  const fallbackId = useId();
  const inputId = id ?? `floating-select-${fallbackId}`;
  const listboxId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const [query, setQuery] = useState(selectedOption?.label ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options.filter((option) => !option.disabled);
    }

    return options.filter(
      (option) =>
        !option.disabled && option.label.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  useEffect(() => {
    setQuery(selectedOption?.label ?? '');
  }, [selectedOption]);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setQuery(selectedOption?.label ?? '');
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);

    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
    };
  }, [selectedOption]);

  useEffect(() => {
    if (!filteredOptions.length) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex(0);
  }, [query, filteredOptions.length]);

  const chooseOption = (option: FloatingSelectOption) => {
    onChange(option.value);
    setQuery(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        filteredOptions.length ? (prev + 1) % filteredOptions.length : -1
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        filteredOptions.length
          ? (prev - 1 + filteredOptions.length) % filteredOptions.length
          : -1
      );
      return;
    }

    if (event.key === 'Enter' && isOpen && highlightedIndex >= 0) {
      event.preventDefault();
      const nextOption = filteredOptions[highlightedIndex];
      if (nextOption) {
        chooseOption(nextOption);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      setQuery(selectedOption?.label ?? '');
    }
  };

  const shouldFloatLabel = Boolean(value || query || isOpen);

  return (
    <div className="w-full" ref={containerRef}>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <label className="relative block w-full">
        <input
          {...inputProps}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          value={query}
          onFocus={(event) => {
            setIsOpen(true);
            onFocus?.(event);
          }}
          onBlur={onBlur}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setIsOpen(true);

            if (!nextQuery && value) {
              onChange('');
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={shouldFloatLabel ? placeholder : ''}
          className={[
            'peer w-full h-[3.2rem] bg-interactive-default outline-none',
            'text-text-primary text-[13px] font-medium px-3.5 placeholder:text-text-muted',
            'border border-transparent rounded pr-10',
            'focus-within:border-interactive-active transition-[border-color] duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        <span
          className={`
            absolute left-4 text-text-muted pointer-events-none transition-all duration-200
            ${shouldFloatLabel ? 'top-1 text-[9px]' : 'top-4 text-[13px]'}
            peer-focus:top-0.5 peer-focus:text-[9px]
          `}
        >
          {label}
        </span>

        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute top-[calc(100%+2px)] right-0 left-0 min-w-full bg-interactive-default border border-interactive-default rounded shadow-[0_8px_24px_rgba(0,0,0,0.55)] z-300 max-h-56 overflow-x-hidden overflow-y-auto animate-drop-in"
          >
            {filteredOptions.length ? (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    chooseOption(option);
                  }}
                  className={[
                    'flex items-center w-full px-3.5 py-3 text-left',
                    'text-text-primary text-[13px] font-medium transition-colors duration-150',
                    index === highlightedIndex || value === option.value
                      ? 'bg-bg-base'
                      : 'hover:bg-bg-base',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3.5 py-3 text-[13px] font-medium text-text-muted">
                No results
              </div>
            )}
          </div>
        ) : null}
      </label>

      {error ? <p className="mt-1 text-red-400 text-xs">{error}</p> : null}
    </div>
  );
};

export default FloatingSelectField;
