import type { Metadata } from "next";
import { ShortlistReplyView } from "../_components/shortlist-reply-view";

export const metadata: Metadata = {
  title: "Confirm your availability",
  robots: { index: false, follow: false },
};

export default async function ShortlistReplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ answer?: string }>;
}) {
  const { token } = await params;
  const { answer } = await searchParams;

  return (
    <ShortlistReplyView
      token={token}
      answer={answer === "no" ? "no" : answer === "yes" ? "yes" : null}
    />
  );
}
