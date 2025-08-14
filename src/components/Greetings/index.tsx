type Props = {
  isAuthenticated: boolean;
};

const Greetings = ({ isAuthenticated }: Props) => {
  if (!isAuthenticated) return null;

  return (
    <span className="mb-10 text-center text-5xl font-bold sm:text-6xl">
      Hello, Admin! 👋
    </span>
  );
};

export default Greetings;
