'use client';

import Icon from '../Icons';
import useDebounce from '@/hooks/useDebounce';

type Props = {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const SearchInput = ({
  onSearch,
  placeholder = 'Search...',
  className = '',
}: Props) => {
  const debouncedOnSearch = useDebounce((...args: unknown[]) => {
    onSearch(args[0] as string);
  }, 1000);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    debouncedOnSearch(text);
  };

  return (
    <div className={`relative ${className}`}>
      <Icon
        name="Search"
        className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-gray-400 sm:h-5 sm:w-5"
      />
      <input
        type="text"
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-full border-2 border-[#ffffff]/[0.2] bg-gray-200 py-0 pr-2 pl-8 text-sm text-gray-900 shadow-sm shadow-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:py-1 sm:pr-4 sm:pl-10 sm:text-base"
      />
    </div>
  );
};

export default SearchInput;
