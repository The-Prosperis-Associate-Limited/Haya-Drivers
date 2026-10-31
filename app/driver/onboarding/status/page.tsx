"use client";

import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDocuments } from "@/hooks/use-documents";
import { useOnboardingProfile } from "@/hooks/use-onboarding-profile";
import { useVerificationStatus } from "@/hooks/use-verification-status";
import { DOCUMENT_LABELS, cn, formatDateTime } from "@/lib/utils";
import { BadgeCheck, Check, CircleAlert, Gift, GraduationCap, Hourglass, LayoutGrid, Lock, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DocumentRow } from "../_components/document-row";
import { StepNote, StepPanel } from "../_components/step-panel";

const Hero = function ({ icon: Icon, title, body, tone = "brand" }: { icon: LucideIcon; title: string; body: string; tone?: "brand" | "green" }) {
  return (
    <div
      className={cn(
        "grid place-items-center gap-2.5 rounded-[22px] px-5 py-8 text-center text-white",
        tone === "brand"
          ? "bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%),linear-gradient(135deg,#2f6bf6_0%,#1f56d9_60%,#1a46b3_100%)]"
          : "bg-[radial-gradient(120%_140%_at_100%_0%,#4ade80_0%,transparent_55%),linear-gradient(135deg,#16a34a_0%,#15803d_100%)]",
      )}
    >
      <span className="grid size-[72px] place-items-center rounded-full bg-white shadow-[0_0_0_10px_rgba(255,255,255,0.14)]">
        <Icon className={cn("size-8", tone === "brand" ? "text-brand" : "text-emerald-600")} />
      </span>
      <h1 className="mt-2 text-[26px] leading-tight font-semibold tracking-tight lg:text-[30px]">{title}</h1>
      <p className="max-w-[460px] text-sm text-white/85">{body}</p>
    </div>
  );
};

const WaitTile = function ({ icon: Icon, title, body, href, tone, locked }: { icon: LucideIcon; title: string; body: string; href?: string; tone: string; locked?: boolean }) {
  const content = (
    <>
      <span className="flex items-center justify-between">
        <span className={cn("grid size-9 place-items-center rounded-[11px]", tone)}>
          <Icon className="size-5" />
        </span>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            <Lock className="size-3" />
            Coming soon
          </span>
        )}
      </span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-muted-foreground text-[12.5px]">{body}</span>
    </>
  );
  const classes = "border-border grid gap-2 rounded-2xl border bg-white p-4";

  if (locked || !href)
    return (
      <div className={cn(classes, "cursor-not-allowed opacity-70")} aria-disabled="true">
        {content}
      </div>
    );

  return (
    <Link href={href} className={cn(classes, "transition hover:-translate-y-px hover:border-blue-200")}>
      {content}
    </Link>
  );
};

export default function OnboardingStatus() {
  const router = useRouter();
  const { verification, isFetching } = useVerificationStatus();
  const { profile } = useOnboardingProfile();
  const { documents } = useGetDocuments();

  const firstName = profile?.user.first_name ?? "there";
  const status = verification?.status;

  useEffect(() => {
    if (status === "UNSUBMITTED") router.replace("/driver/onboarding");
  }, [status, router]);

  if ((isFetching && !verification) || status === "UNSUBMITTED") {
    return (
      <OnboardingShell step="STATUS">
        <Skeleton className="h-64 w-full rounded-[22px]" />
        <Skeleton className="mt-4 h-40 w-full rounded-[18px]" />
      </OnboardingShell>
    );
  }

  if (status === "APPROVED") {
    return (
      <OnboardingShell step="STATUS" footer={{ label: "Go to dashboard", onClick: () => router.push("/driver/dashboard"), hideBack: true }}>
        <Hero icon={BadgeCheck} tone="green" title={`You're verified, ${firstName}`} body={`Every document cleared review. Your profile is now visible to clients${profile?.user.state_of_residence ? ` across ${profile.user.state_of_residence}` : ""}.`} />
      </OnboardingShell>
    );
  }

  if (status === "REJECTED") {
    const rejected = documents.filter((document) => document.status === "REJECTED");
    const accepted = documents.filter((document) => document.status !== "REJECTED");
    const count = rejected.length || verification?.rejected_documents.length || 0;

    return (
      <OnboardingShell
        step="STATUS"
        footer={{
          label: "Replace documents",
          onClick: () => router.push("/driver/onboarding/documents"),
          hideBack: true,
          hint: `${count || "Some"} document${count === 1 ? "" : "s"} to fix`,
        }}
      >
        <span className="text-xs font-semibold tracking-[0.1em] text-red-600 uppercase">Action needed</span>
        <h1 className="mt-1.5 text-[26px] leading-tight font-semibold tracking-tight lg:text-[30px]">
          {count === 1 ? "We couldn't verify one document" : `We couldn't verify ${count || "some"} documents`}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Everything else looks good. Replace these, then resubmit from the review step - you won&apos;t need to redo anything else.</p>

        <div className="mt-6 space-y-3.5">
          <StepPanel>
            <div className="space-y-2.5" data-testid="rejected-documents">
              {rejected.length ? (
                rejected.map((document) => (
                  <DocumentRow
                    key={document.id}
                    type={document.type}
                    label={DOCUMENT_LABELS[document.type]}
                    status="REJECTED"
                    rejectionReason={document.rejection_reason}
                    onUpload={() => undefined}
                    onReplace={() => router.push("/driver/onboarding/documents")}
                  />
                ))
              ) : (
                <StepNote icon={CircleAlert} tone="red">
                  {verification?.rejection_reason ?? "Our team asked for changes to your application."}
                </StepNote>
              )}
              {accepted.map((document) => (
                <DocumentRow key={document.id} type={document.type} label={DOCUMENT_LABELS[document.type]} status={document.status} fileName={document.file_name} onUpload={() => undefined}
                    onReplace={() => router.push("/driver/onboarding/documents")} />
              ))}
            </div>
          </StepPanel>

          <StepNote icon={CircleAlert}>When you resubmit, our team looks at your whole application again - including the documents accepted last time.</StepNote>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step="STATUS" footer={{ label: "Go to dashboard", onClick: () => router.push("/driver/dashboard"), hideBack: true, hint: "We'll email you the result" }}>
      <Hero icon={Hourglass} title={`You're in the queue, ${firstName}`} body="We're checking your documents and calling your guarantor. Most drivers hear back within 24-48 hours." />

      <div className="mt-4 space-y-3.5">
        <StepPanel>
          <ol className="grid">
            {[
              { title: "Application submitted", body: verification?.submitted_at ? formatDateTime(verification.submitted_at) : "Received", done: true },
              { title: "Documents and guarantor checked", body: "Usually within a day", now: true },
              { title: "You're verified and visible to clients", body: "We'll email you the moment it happens" },
            ].map((item, index) => (
              <li key={item.title} className="relative flex gap-3 pb-4 last:pb-0">
                {index < 2 && <span className={cn("absolute top-[26px] bottom-0.5 left-3 w-0.5 rounded", item.done ? "bg-brand" : "bg-border")} />}
                <span
                  className={cn(
                    "border-border relative grid size-[26px] shrink-0 place-items-center rounded-full border-2 bg-white text-[11px] font-bold text-slate-400",
                    item.done && "border-brand bg-brand text-white",
                    item.now && "border-brand text-brand ring-brand-soft ring-4",
                  )}
                >
                  {item.done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                </span>
                <span>
                  <span className={cn("block text-[13px] font-semibold", !item.done && !item.now && "text-muted-foreground font-medium")}>{item.title}</span>
                  <span className="text-muted-foreground text-xs">{item.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </StepPanel>

        <StepPanel title="While you wait" description="Things that help you get hired faster" icon={Sparkles}>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <WaitTile icon={GraduationCap} tone="bg-brand-soft text-brand" title="Training courses" body="Certificates add up to 30 trust points." locked />
            <WaitTile icon={Gift} tone="bg-violet-50 text-violet-600" title="Refer a driver" body="Earn ₦1,000 for each one who submits." href="/driver/dashboard/referrals" />
            <WaitTile icon={LayoutGrid} tone="bg-emerald-50 text-emerald-600" title="Explore your dashboard" body="Settings, support and your profile." href="/driver/dashboard" />
          </div>
        </StepPanel>
      </div>
    </OnboardingShell>
  );
}
