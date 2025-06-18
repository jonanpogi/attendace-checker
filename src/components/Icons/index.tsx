import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  color?: string;
}

const Icon = ({
  name,
  className = '',
  size = 24,
  color = 'currentColor',
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

  return <LucideIcon className={className} size={size} color={color} />;
};

export default Icon;
