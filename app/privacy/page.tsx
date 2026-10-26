import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Haya Drivers collects, uses, shares and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicy() {
  return (
    <LegalShell title="Privacy policy" updated="4 October 2026">
      <section>
        <p>
          This policy explains what personal data Haya Drivers ("we", "us")
          collects, why we collect it, who we share it with and the choices you
          have. We process personal data in line with the Nigeria Data
          Protection Act and only for the purposes described here.
        </p>
      </section>

      <section>
        <h2>1. What we collect</h2>
        <h3>Everyone</h3>
        <ul>
          <li>Account details: name, email address, phone number, password.</li>
          <li>
            Usage data: pages visited, device and browser information, and IP
            address, used for security and to improve the product.
          </li>
          <li>
            Visitor statistics on our public pages: we count unique daily
            visitors using a one-way hash of IP address and browser information.
            The raw IP address is never stored for this purpose and no cookie is
            set.
          </li>
          <li>
            Support chat messages: what you write to our support chat, including
            the automated assistant described in section 2.
          </li>
        </ul>
        <h3>Clients</h3>
        <ul>
          <li>
            Organisation details where applicable, hiring preferences, and the
            requirements you describe in hire requests - including any optional
            preferences you state about a driver's ethnicity, religion or age
            range.
          </li>
          <li>
            Proof-of-payment documents you upload so we can confirm bank
            transfers.
          </li>
        </ul>
        <h3>Drivers</h3>
        <ul>
          <li>
            Verification data: national identification number (NIN), driving
            licence details and expiry, passport photograph, proof of address,
            and employment history.
          </li>
          <li>
            Profile details you provide during onboarding: date of birth,
            gender, languages, and - optionally - your religion and ethnicity.
            Religion and ethnicity are sensitive personal data: providing them
            is entirely voluntary, they are used only to match you with clients
            who state a preference, and leaving them blank never counts against
            you.
          </li>
          <li>
            Guarantor and reference details: their name, relationship, phone
            number, address and NIN, which you must have their consent to
            provide.
          </li>
          <li>
            Payout details: your bank account name, number and bank, used only
            to pay out your remaining in-app earnings balance.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. How we use your data</h2>
        <ul>
          <li>To verify drivers before they can be hired.</li>
          <li>
            To match clients with suitable drivers and broker engagements.
            Stated preferences (such as ethnicity, religion or age range) guide
            our matching team; they are never used as automatic filters.
          </li>
          <li>
            To administer invoices for our service fee and confirm payments.
            Driver salaries are paid by clients to drivers directly and do not
            pass through us.
          </li>
          <li>
            To answer support chats: an automated assistant generates the first
            reply using the text of your conversation. When it cannot help, or
            when you ask, a human support agent takes over.
          </li>
          <li>
            To send transactional notifications and emails about your account
            and engagements.
          </li>
          <li>To prevent fraud and keep the platform secure.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </section>

      <section>
        <h2>3. Who we share it with</h2>
        <ul>
          <li>
            Clients see a driver's professional profile (name, photograph,
            driver type, experience, trust score, city and state, languages,
            advertised rate). Your religion and ethnicity are never shown on
            your profile - only our matching team sees them, and only to match a
            stated client preference. A driver's phone number, WhatsApp number
            and email are released to a client only after that client's payment
            for the engagement is confirmed.
          </li>
          <li>
            Drivers see the engagement details a client provides (schedule,
            location, requirements) and the client's name once hired.
          </li>
          <li>
            Service providers who process data for us: cloud hosting, media
            storage (Cloudinary), email delivery (Resend), payment processing
            for driver payouts, and AI inference providers (Groq and OpenRouter)
            that process the text of support-chat conversations to generate the
            automated assistant's replies. They may only use the data to provide
            their service to us.
          </li>
          <li>
            Law enforcement or regulators where the law requires it, or to
            protect the safety of our users.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Retention</h2>
        <p>
          We keep your data for as long as your account is active and for as
          long afterwards as we need it to meet legal, accounting or dispute
          resolution obligations. Verification documents belonging to rejected
          or deleted accounts are removed on a rolling schedule.
        </p>
      </section>

      <section>
        <h2>5. Security</h2>
        <p>
          Passwords are stored hashed, verification codes are stored hashed,
          traffic is encrypted in transit, and access to personal data inside
          the company is limited to staff who need it for their role. No system
          is perfectly secure; if a breach affects you, we will notify you and
          the relevant authorities as required by law.
        </p>
      </section>

      <section>
        <h2>6. Your rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal
          data, object to certain processing, and withdraw consent where
          processing is based on consent. Write to{" "}
          <a
            href="mailto:hayadrivers@prosperisassociates.com"
            className="text-brand underline underline-offset-2"
          >
            hayadrivers@prosperisassociates.com
          </a>{" "}
          and we will respond within the timelines set by the Nigeria Data
          Protection Act. Note that some data must be retained where the law
          requires it (for example, records of confirmed payments).
        </p>
      </section>

      <section>
        <h2>7. Cookies</h2>
        <p>
          We use cookies strictly to keep you signed in and to remember which
          surface of the platform your session belongs to. We do not use
          advertising or cross-site tracking cookies, and our visitor statistics
          work without cookies entirely.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          The platform is for adults. We do not knowingly collect data from
          anyone under 18; if you believe a minor has created an account,
          contact us and we will remove it.
        </p>
      </section>

      <section>
        <h2>9. Changes and contact</h2>
        <p>
          We may update this policy from time to time; material changes will be
          announced on the platform or by email. Questions about this policy:{" "}
          <a
            href="mailto:hayadrivers@prosperisassociates.com"
            className="text-brand underline underline-offset-2"
          >
            hayadrivers@prosperisassociates.com
          </a>
          . See also our{" "}
          <Link
            href="/terms"
            className="text-brand underline underline-offset-2"
          >
            terms of service
          </Link>
          .
        </p>
      </section>
    </LegalShell>
  );
}
