"use client";

export function Logo() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex">
          <span className="bg-black text-white px-5 py-2 rounded-md dark:rounded-r-none transition-all duration-300">
            Dev
          </span>
          <span className="bg-white text-black px-5 py-2 rounded-md light:rounded-l-none transition-all duration-300">
            All
          </span>
        </div>
        <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-secondary-foreground mt-1">
          By Maadhava
        </p>
      </div>
    </>
  );
}
