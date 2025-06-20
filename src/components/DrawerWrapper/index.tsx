type Props = {
  children: React.ReactNode;
};

const DrawerFormWrapper = ({ children }: Props) => {
  return (
    <div className="flex h-full w-full flex-col overflow-auto p-8">
      {children}
    </div>
  );
};

export default DrawerFormWrapper;
