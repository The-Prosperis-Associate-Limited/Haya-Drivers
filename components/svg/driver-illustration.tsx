import Image from "next/image";

export const DriverIllustration = function () {
  return (
    <div className="bg-brand hidden min-h-[80vh] w-full items-center justify-center overflow-hidden rounded-3xl p-8 lg:flex xl:p-12">
      <Image
        src="/driver-auth.svg"
        alt=""
        width={559}
        height={606}
        priority
        className="h-full max-h-[560px] w-full object-contain"
      />
    </div>
  );
};
