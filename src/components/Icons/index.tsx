'use client';

import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  color?: string;
  onClick?: () => void;
}

const Icon = ({
  name,
  className = '',
  size = 24,
  color = 'currentColor',
  onClick = () => {},
}: IconProps) => {
  const LucideIcon = LucideIcons[name] as
    | React.ComponentType<{
        className?: string;
        size?: number;
        color?: string;
      }>
    | undefined;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" does not exist in Lucide icons.`);
    return null;
  }

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-transform duration-200 hover:scale-105"
    >
      <LucideIcon className={className} size={size} color={color} />
    </div>
  );
};

export default Icon;
