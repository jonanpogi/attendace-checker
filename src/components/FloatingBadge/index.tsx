import useMediaQuery from '@/hooks/useMediaQuery';

const FloatingBadge = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  return (
    <a
      href="https://www.linkedin.com/in/jonan-bie-96b02720b/"
      target="_blank"
      rel="noopener noreferrer"
      className={`${isMobile ? 'flex' : 'fixed right-4 bottom-4 z-50 rounded-full px-4 py-2'} text-[12px] font-medium text-gray-600 shadow-lg transition hover:scale-105`}
    >
      💻 - Built by Jonan Bie
    </a>
  );
};

export default FloatingBadge;
