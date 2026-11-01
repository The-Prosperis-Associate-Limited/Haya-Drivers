import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  className?: string;
}

export const TegatLogo = function ({ size = 44, className }: Props) {
  return (
    <Image
      src="/logo.svg"
      alt="Haya Drivers"
      width={size}
      height={size}
      priority
      className={cn("shrink-0", className)}
    />
  );
};
