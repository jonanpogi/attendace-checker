import { ComponentProps } from 'react';

type Props = ComponentProps<'button'> & {
  children?: React.ReactNode | string;
  className?: string;
};

const ButtonPrimary = ({ ...props }: Props) => {
  return (
    <button
      {...props}
      className={`flex items-center justify-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-gray-50 hover:scale-110 sm:text-base ${props.className}`}
      style={{
        background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
      }}
    >
      {props.children}
    </button>
  );
};

export default ButtonPrimary;
