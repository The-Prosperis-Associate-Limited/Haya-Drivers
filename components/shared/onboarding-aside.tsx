import Image from "next/image";

export const OnboardingAside = function ({ children }: { children: React.ReactNode }) {
  return (
    <aside className="from-brand relative isolate hidden h-screen flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-linear-to-b via-[#1f56d9] to-[#1a46b3] px-6 py-7 text-white [scrollbar-width:none] lg:sticky lg:top-0 lg:flex [&::-webkit-scrollbar]:hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%)]" />
        <Image src="/cloud-top-right.svg" alt="" width={260} height={100} className="absolute -top-2 -right-16 w-[240px] opacity-25" />
      </div>
      {children}
    </aside>
  );
};
