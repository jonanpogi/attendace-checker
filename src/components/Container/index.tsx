type Props = {
  children: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4">
      {children}
    </div>
  );
};

export default Container;
