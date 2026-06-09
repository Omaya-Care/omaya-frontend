import React from 'react';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface ChipSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
}

const ChipSelect = ({ options, selected, onChange, max }: ChipSelectProps) => {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      if (max === 1) {
        onChange([value]);
      } else if (!max || selected.length < max) {
        onChange([...selected, value]);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <div
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={`
              px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all flex flex-col
              ${
                isSelected
                  ? 'border-[#93406B] bg-[#F7E8F0] text-[#93406B] font-medium'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#93406B]/40 font-normal'
              }
            `}
          >
            <span className={option.description ? 'font-semibold' : ''}>{option.label}</span>
            {option.description && (
              <span className="text-xs mt-0.5 opacity-80 font-normal">
                {option.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { ChipSelect };
