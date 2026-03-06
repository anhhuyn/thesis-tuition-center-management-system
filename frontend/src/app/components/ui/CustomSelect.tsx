import { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-auto min-w-[180px]">

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between pl-4 pr-4 h-10
                    bg-white border rounded-lg
                    transition-all duration-200
                    ${open
            ? "border-purple-500 ring-2 ring-purple-200"
            : "border-gray-300 hover:border-purple-400"
          }`}
      >
        <span className="text-gray-700 text-sm">
          {selected?.label || placeholder}
        </span>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180 text-purple-500" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                ${
                  value === option.value
                    ? "bg-purple-50 text-purple-600 font-medium"
                    : "hover:bg-purple-50"
                }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
