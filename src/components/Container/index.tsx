'use client';

import Footer from '../Footer';

type Props = {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
};

const Container = ({ children, className, showFooter = false }: Props) => {
  const defaultClasses =
    'flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto hide-scrollbar px-4 py-8';
  return (
    <>
      <div className={className ? className : defaultClasses}>{children}</div>
      {showFooter && <Footer />}
    </>
  );
};

export default Container;
