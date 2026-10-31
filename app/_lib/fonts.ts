import { Great_Vibes } from "next/font/google";
import localFont from "next/font/local";

export const generalSans = localFont({
  src: [
    { path: "../fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/GeneralSans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-general-sans-face",
  display: "swap",
});

export const zodiak = localFont({
  src: "../fonts/Zodiak-400.woff2",
  weight: "400",
  variable: "--font-zodiak-face",
  display: "swap",
});

export const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes-face",
  display: "swap",
});
