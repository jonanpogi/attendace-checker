'use client';

import { useRouter } from 'next/navigation';
import Icon, { IconName } from '../Icons';
import SpotlightCard from '../react-bits/SpotLightCard';

type Props = {
  title: string;
  description: string;
  icon: IconName;
  link: string;
};

const SelectionItem = ({ title, description, icon, link }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(link);
  };

  return (
    <SpotlightCard
      onClick={handleClick}
      className="flex h-auto min-h-44 w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl bg-slate-900 p-4 text-center shadow-slate-400 transition-transform hover:scale-105 hover:shadow-md active:scale-95"
    >
      <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row">
        <Icon name={icon} className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10" />
        <h3 className="text-md font-semibold text-gray-50 sm:text-lg">
          {title}
        </h3>
      </div>
      <p className="text-xs text-gray-400 sm:text-sm">{description}</p>
    </SpotlightCard>
  );
};

export default SelectionItem;
