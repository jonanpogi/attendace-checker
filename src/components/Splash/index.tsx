import useMediaQuery from '@/hooks/useMediaQuery';
import FadeContent from '../FadeContent';

const Splash = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <FadeContent
      blur={true}
      duration={250}
      easing="ease-out"
      initialOpacity={1}
      className="absolute inset-0 m-0 flex h-full w-full items-center justify-center bg-gray-950 p-0"
      style={{
        background: "url('/splash/splash.png') no-repeat center center fixed",
        backgroundSize: isMobile ? 'cover' : 'contain',
      }}
    >
      <></>
    </FadeContent>
  );
};

export default Splash;
