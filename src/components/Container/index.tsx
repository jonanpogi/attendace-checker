'use client';

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => {
  const defaultClasses =
    'flex h-full sm:h-screen w-full flex-col items-center justify-center overflow-y-auto hide-scrollbar px-4 py-8';
  return (
    <div className={className ? className : defaultClasses}>{children}</div>
  );
};

export default Container;
