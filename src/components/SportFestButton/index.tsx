const SportFestButton = () => {
  return (
    <a
      href="/sports"
      className="fixed bottom-2 left-[50%] z-50 w-[300px] translate-x-[-50%] rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 px-4 py-2 text-center text-sm font-extrabold tracking-widest text-black uppercase shadow-[0_0_25px_rgba(217,70,239,0.6)] transition-transform hover:scale-105 hover:shadow-[0_0_35px_rgba(217,70,239,0.85)] sm:bottom-6 sm:left-6 sm:w-auto sm:translate-x-0 sm:px-6 sm:py-4 sm:text-lg"
    >
      {/* FEATURED badge (upper-left of the button) */}
      <span className="pointer-events-none absolute -top-2 -right-2 animate-bounce rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black tracking-widest text-amber-900 uppercase shadow-[0_0_12px_rgba(251,191,36,0.6)] ring-1 ring-amber-200 select-none">
        Featured
      </span>
      🏆 GO TO SPORTS FEST SCOREBOARD!
    </a>
  );
};

export default SportFestButton;
