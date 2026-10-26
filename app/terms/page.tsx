import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that govern your use of Haya Drivers - for clients hiring drivers and for drivers offering their services.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfService() {
  return (
    <LegalShell title="Terms of service" updated="4 October 2026">
      <section>
        <p>
          These terms govern your use of Haya Drivers (the "platform", "we",
          "us"), a service that connects clients with vetted, professional
          drivers in Nigeria. By creating an account or using the platform you
          agree to these terms. If you do not agree, do not use the platform.
        </p>
      </section>

      <section>
        <h2>1. What Haya Drivers does</h2>
        <p>
          Haya Drivers verifies the identity, driving licence and guarantor of
          every driver on the platform before they can be hired, and brokers
          engagements between clients and drivers. We facilitate introductions
          and charge a service fee for doing so; the driver's salary is agreed
          through the platform but is paid by the client to the driver directly
          and never passes through us. Unless expressly stated otherwise,
          drivers are not our employees; the working relationship for an
          engagement is between the client and the driver.
        </p>
      </section>

      <section>
        <h2>2. Accounts and eligibility</h2>
        <ul>
          <li>You must be at least 18 years old to use the platform.</li>
          <li>
            You must provide accurate, current and complete information when you
            register and keep it up to date.
          </li>
          <li>
            You are responsible for everything done under your account and for
            keeping your sign-in credentials confidential.
          </li>
          <li>
            One person or organisation may not hold multiple accounts for the
            purpose of evading a suspension or restriction.
          </li>
          <li>
            An account that has not been signed into for 90 days may be
            deactivated for inactivity. Signing in again lets you reactivate it
            in one step, with your data exactly as you left it.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. For clients</h2>
        <ul>
          <li>
            A hire request (whether for a named driver or a request that our
            team matches) is an invitation for us to review and issue an
            invoice. It is not binding until you pay and we confirm payment.
          </li>
          <li>
            Invoices are payable by bank transfer to the organisation account
            shown on your request. The invoice covers our service fee plus VAT
            on that fee only. The driver's salary is not on the invoice: you pay
            it to the driver directly, at the rate shown on your request, once
            the engagement starts.
          </li>
          <li>
            You are responsible for paying your driver's salary in full and on
            time for the duration of the engagement. Failing to pay a driver for
            work done is a breach of these terms and may lead to suspension of
            your account.
          </li>
          <li>
            After transferring, you must upload proof of payment. An engagement
            starts only after our team confirms that the money arrived. We may
            reject unclear or mismatched proof and ask you to re-upload.
          </li>
          <li>
            A driver's personal contact details are released to you only after
            your payment is confirmed. You may use them solely for the
            engagement you paid for.
          </li>
          <li>
            You agree to treat drivers lawfully and respectfully, to provide the
            working conditions described in your request, and not to ask a
            driver to do anything unlawful or unsafe.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. For drivers</h2>
        <ul>
          <li>
            You must complete verification truthfully. Submitting forged or
            altered documents, or another person's identity, leads to permanent
            removal and may be reported to the authorities.
          </li>
          <li>
            Your guarantor must be a working professional who has genuinely
            agreed to stand for you. We may contact them to confirm.
          </li>
          <li>
            Your salary for an engagement brokered through the platform is paid
            to you directly by the client at the rate agreed on the engagement.
            We do not hold, deduct from, or guarantee your salary. If a client
            fails to pay you, report it to us - we will assist in good faith,
            including restricting the client's account, but we are not liable
            for a client's failure to pay.
          </li>
          <li>
            Earnings balances accrued on the platform before 4 October 2026
            remain yours and can be withdrawn through the payout process in your
            settings.
          </li>
          <li>
            You agree to show up for engagements you accept, to drive safely and
            lawfully, and to hold a valid licence for the vehicle class you are
            engaged to drive at all times.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Payments, fees and refunds</h2>
        <ul>
          <li>
            All prices are stated in Nigerian naira unless shown otherwise. VAT
            is applied to our service fee at the prevailing statutory rate -
            never to the driver's salary.
          </li>
          <li>
            Our service fee depends on the engagement: for full-time hires it is
            a percentage of the driver's annual gross salary, and for contract
            hires it is a one-time fee based on the contract length and your
            client type, with a discount when hiring multiple drivers on longer
            contracts. The exact fee and its breakdown are shown on every
            invoice before you pay.
          </li>
          <li>
            Fees are non-refundable once a payment has been confirmed and the
            driver's details released, except where required by law or where we
            fail to deliver the service paid for.
          </li>
          <li>
            If a confirmed engagement cannot be fulfilled (for example, the
            assigned driver becomes unavailable before starting), we will offer
            a replacement driver or a refund of the service fee paid.
          </li>
          <li>
            Payment confirmation is a manual review of your bank transfer. We
            are not responsible for delays caused by your bank or by transfers
            made without the reference we ask you to include.
          </li>
          <li>
            Salary payments between client and driver are made outside the
            platform, and we are not a party to them. We encourage both sides to
            keep their own records of salary payments.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Prohibited conduct</h2>
        <ul>
          <li>
            Circumventing the platform: using it to find a driver or client and
            then engaging them off-platform to avoid fees.
          </li>
          <li>Submitting false information, documents or proof of payment.</li>
          <li>
            Harassment, discrimination or abuse of any user or of our staff.
          </li>
          <li>
            Scraping, probing or interfering with the platform's operation or
            security.
          </li>
        </ul>
        <p>
          We may suspend or terminate accounts that breach these terms, withhold
          pending payouts connected to fraud, and pursue any other remedy
          available to us.
        </p>
      </section>

      <section>
        <h2>7. Reviews and content</h2>
        <p>
          Reviews must reflect a genuine experience. We may remove content that
          is unlawful, deceptive or abusive. By posting content you grant us a
          non-exclusive licence to display it on the platform.
        </p>
      </section>

      <section>
        <h2>8. Disclaimers and liability</h2>
        <p>
          We verify drivers with reasonable care, but verification is not a
          guarantee of future conduct. To the fullest extent permitted by law,
          the platform is provided "as is", and our total liability to you for
          any claim arising out of the platform is limited to the fees you paid
          us for the engagement giving rise to the claim. Nothing in these terms
          excludes liability that cannot be excluded by law.
        </p>
      </section>

      <section>
        <h2>9. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Material changes will be
          announced on the platform or by email before they take effect.
          Continuing to use the platform after a change takes effect means you
          accept the updated terms.
        </p>
      </section>

      <section>
        <h2>10. Governing law and contact</h2>
        <p>
          These terms are governed by the laws of the Federal Republic of
          Nigeria, and the courts of Nigeria have jurisdiction over disputes
          arising from them. Questions about these terms:{" "}
          <a
            href="mailto:hayadrivers@prosperisassociates.com"
            className="text-brand underline underline-offset-2"
          >
            hayadrivers@prosperisassociates.com
          </a>
          . See also our{" "}
          <Link
            href="/privacy"
            className="text-brand underline underline-offset-2"
          >
            privacy policy
          </Link>
          .
        </p>
      </section>
    </LegalShell>
  );
}
