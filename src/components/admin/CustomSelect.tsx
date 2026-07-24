import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi2";

interface Props {
  options: { id: string; name: string }[];
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  placeholder?: string;
}

const CustomSelect: React.FC<Props> = ({ options, value, onChange, error, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <div className="relative w-full" ref={ref} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm
          bg-white transition-all duration-200 outline-none
          ${error ? "border-rose-500" : "border-[#60340e]/20 hover:border-[#60340e]/40"} 
          ${open ? "ring-1 ring-[#60340e] border-[#60340e]" : ""}
        `}
      >
        <span className={selectedOption ? "text-[#2C1A0E] font-semibold" : "text-[#60340e]/50"}>
          {selectedOption ? selectedOption.name : placeholder || "اختر القسم"}
        </span>
        <HiChevronDown className={`w-4 h-4 text-[#60340e]/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute z-50 w-full right-0 mt-1.5 max-h-56 overflow-auto border border-[#60340e]/15 rounded-xl bg-white elevation-3
          transform origin-top transition-all duration-200
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              onChange(o.id);
              setOpen(false);
            }}
            className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
              value === o.id
                ? "bg-[#60340e] text-[#F7F3E8] font-bold"
                : "text-[#2C1A0E] hover:bg-[#FAF6ED]"
            }`}
          >
            {o.name}
          </button>
        ))}

        {options.length === 0 && (
          <div className="px-4 py-3 text-xs text-gray-400 text-center">لا توجد خيارات متاحة</div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
