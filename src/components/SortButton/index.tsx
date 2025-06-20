'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '../Icons';

type SortOption = {
  name: string;
  label: string;
  key: string;
  ascending: boolean;
};

type Props = {
  options: SortOption[];
  selected: string;
  onChange: (option: SortOption) => void;
};

const SortButton = ({ options, selected, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.name === selected);

  return (
    <div
      className="relative inline-block cursor-pointer text-left"
      ref={dropdownRef}
    >
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="sm:text-md flex w-full items-center gap-2 rounded-full text-sm font-semibold text-gray-50"
      >
        <Icon name="Filter" className="h-2 w-2 sm:h-3 sm:w-3" />
        <span>Sort by {selectedOption?.label ?? 'Select'}</span>
      </div>

      {open && (
        <div className="ring-opacity-5 absolute -left-32 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black sm:-left-24">
          <div className="py-1">
            {options.map((option) => (
              <label
                key={option.name}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <input
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  type="radio"
                  name="sort"
                  value={option.name}
                  checked={selected === option.name}
                  onChange={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortButton;
