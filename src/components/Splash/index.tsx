import FadeContent from '../FadeContent';

const Splash = () => {
  return (
    <FadeContent
      blur
      duration={1000}
      easing="ease-out"
      initialOpacity={1}
      className="fixed inset-0 m-0 flex h-dvh w-screen items-center justify-center bg-gray-950 bg-cover bg-center bg-no-repeat md:bg-contain"
      style={{ backgroundImage: "url('/splash/splash.png')" }}
    />
  );
};
export default Splash;
