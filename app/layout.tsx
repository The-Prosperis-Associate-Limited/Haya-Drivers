import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProvider } from "./_components/provider";
import { VisitTracker } from "./_components/visit-tracker";
import { generalSans, greatVibes, zodiak } from "./_lib/fonts";
import { rootMetadata, viewport } from "./_lib/metadata";

export const metadata = rootMetadata;
export { viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        generalSans.variable,
        zodiak.variable,
        greatVibes.variable,
      )}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
        <VisitTracker />
      </body>
    </html>
  );
}
