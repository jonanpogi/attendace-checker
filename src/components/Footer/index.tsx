const Footer = () => {
  return (
    <div className="relative flex h-[100px] w-full items-center justify-between border-t border-gray-600 bg-slate-900 px-4 py-3 text-xs text-white shadow-md sm:text-sm">
      <a
        href="https://www.linkedin.com/in/jonan-bie-96b02720b/"
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute right-1 rounded-full px-4 py-2 text-[12px] font-medium text-gray-600 shadow-md transition hover:scale-105`}
      >
        💻 - Built by Jonan Bie
      </a>
    </div>
  );
};

export default Footer;
