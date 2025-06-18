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
      className="flex min-h-40 w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl bg-slate-900 p-4 text-center shadow-slate-400 transition-transform hover:scale-105 hover:shadow-md active:scale-95"
    >
      <div className="mb-2 flex gap-2">
        <Icon name={icon} className="text-gray-50" size={32} />
        <h3 className="mb-2 text-lg font-semibold text-gray-50">{title}</h3>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </SpotlightCard>
  );
};

export default SelectionItem;
