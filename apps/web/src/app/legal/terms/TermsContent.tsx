"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SECTIONS = [
  { id: "about", label: "About Delegare" },
  { id: "accounts", label: "Accounts & eligibility" },
  { id: "delegates", label: "Spending delegates" },
  { id: "merchants", label: "Merchant terms" },
  { id: "payments", label: "Payments & fees" },
  { id: "crypto", label: "Crypto & on-chain" },
  { id: "agent", label: "Agent context" },
  { id: "prohibited", label: "Prohibited use" },
  { id: "liability", label: "Liability & disclaimers" },
  { id: "disputes", label: "Disputes & refunds" },
  { id: "ip", label: "Intellectual property" },
  { id: "termination", label: "Termination" },
  { id: "governing", label: "Governing law" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  const [active, setActive] = useState("about");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        return el ? { id: s.id, top: el.getBoundingClientRect().top } : null;
      }).filter((o): o is { id: string; top: number } => Boolean(o));
      const current = offsets.filter((o) => o!.top <= 120).pop();
      if (current) setActive(current.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main
      style={{
        background: "#0c0c0c",
        color: "#f0ede8",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        minHeight: "100vh",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 48px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 0.3s, border-color 0.3s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled {
          background: rgba(12,12,12,0.92);
          backdrop-filter: blur(12px);
          border-color: rgba(240,237,232,0.08);
        }
        .nav-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 20px; color: #f0ede8;
          text-decoration: none; letter-spacing: -0.3px;
        }
        .nav-logo span { color: #c8b99a; }
        .nav-back {
          font-size: 13px; color: rgba(240,237,232,0.45);
          text-decoration: none; transition: color 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-back:hover { color: #f0ede8; }

        .hero {
          padding: 140px 48px 72px;
          max-width: 920px; margin: 0 auto;
          border-bottom: 1px solid rgba(240,237,232,0.07);
        }
        .hero-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(240,237,232,0.3);
          margin-bottom: 20px;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(40px, 5vw, 56px);
          line-height: 1.05; letter-spacing: -1px; color: #f0ede8;
          margin-bottom: 20px;
        }
        .hero-title em { font-style: italic; color: #c8b99a; }
        .hero-meta { display: flex; gap: 32px; flex-wrap: wrap; }
        .hero-meta-item {
          font-size: 13px; color: rgba(240,237,232,0.35); font-weight: 300;
        }
        .hero-meta-item strong { color: rgba(240,237,232,0.6); font-weight: 500; }

        .layout {
          max-width: 1100px; margin: 0 auto;
          padding: 0 48px 120px;
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 64px;
          align-items: start;
        }

        .sidebar {
          position: sticky; top: 100px;
          padding-top: 48px;
        }
        .sidebar-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(240,237,232,0.2);
          margin-bottom: 16px;
        }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
        .sidebar-link {
          font-size: 13px; font-weight: 400;
          color: rgba(240,237,232,0.35);
          text-decoration: none; padding: 5px 10px;
          border-radius: 6px; transition: color 0.15s, background 0.15s;
          border-left: 2px solid transparent;
        }
        .sidebar-link:hover { color: rgba(240,237,232,0.7); }
        .sidebar-link.active {
          color: #c8b99a;
          border-left-color: #c8b99a;
          background: rgba(200,185,154,0.06);
        }

        .content { padding-top: 48px; }
        .policy-section { margin-bottom: 64px; scroll-margin-top: 100px; }
        .section-num {
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(240,237,232,0.2);
          margin-bottom: 10px;
        }
        h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px; color: #f0ede8;
          line-height: 1.15; letter-spacing: -0.5px;
          margin-bottom: 20px;
        }
        h3 {
          font-size: 15px; font-weight: 500; color: #f0ede8;
          margin-top: 32px; margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(240,237,232,0.07);
        }
        p {
          font-size: 15px; line-height: 1.75;
          color: rgba(240,237,232,0.55); font-weight: 300;
          margin-bottom: 16px;
        }
        ul {
          margin: 0 0 16px 0; padding: 0;
          list-style: none;
        }
        ul li {
          font-size: 15px; line-height: 1.7;
          color: rgba(240,237,232,0.5); font-weight: 300;
          padding: 4px 0 4px 20px; position: relative;
        }
        ul li::before {
          content: '✦';
          position: absolute; left: 0;
          font-size: 8px; color: #c8b99a;
          top: 9px;
        }
        strong { font-weight: 500; color: rgba(240,237,232,0.8); }
        code {
          font-family: 'Fira Code', 'DM Mono', monospace;
          font-size: 13px; color: #c8b99a;
          background: rgba(200,185,154,0.1);
          padding: 2px 6px; border-radius: 4px;
        }
        a {
          color: #c8b99a; text-decoration: none;
          border-bottom: 1px solid rgba(200,185,154,0.3);
          transition: border-color 0.2s;
        }
        a:hover { border-color: #c8b99a; }

        .callout {
          border: 1px solid rgba(240,237,232,0.09);
          border-radius: 12px; padding: 24px 28px;
          margin: 24px 0;
          background: rgba(240,237,232,0.02);
        }
        .callout-warn {
          border-color: rgba(200,185,154,0.2);
          background: rgba(200,185,154,0.04);
        }
        .callout-red {
          border-color: rgba(220,80,80,0.2);
          background: rgba(220,80,80,0.04);
        }
        .callout-green {
          border-color: rgba(126,200,152,0.2);
          background: rgba(126,200,152,0.04);
        }
        .callout-title {
          font-size: 13px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 10px;
        }
        .callout-warn .callout-title { color: #c8b99a; }
        .callout-red .callout-title { color: #e87c7c; }
        .callout-green .callout-title { color: #7ec898; }
        .callout p { margin-bottom: 8px; font-size: 14px; }
        .callout p:last-child { margin-bottom: 0; }
        .callout ul li { font-size: 14px; }

        .contact-card {
          border: 1px solid rgba(240,237,232,0.09);
          border-radius: 16px; padding: 36px;
          background: rgba(240,237,232,0.02);
          margin-top: 24px;
        }
        .contact-row {
          display: flex; gap: 16px; margin-bottom: 20px;
          align-items: flex-start;
        }
        .contact-row:last-child { margin-bottom: 0; }
        .contact-label {
          font-size: 12px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(240,237,232,0.3);
          min-width: 140px; padding-top: 2px;
        }
        .contact-value {
          font-size: 14px; color: rgba(240,237,232,0.6); font-weight: 300;
        }

        .terms-footer {
          border-top: 1px solid rgba(240,237,232,0.07);
          padding: 32px 0 0; margin-top: 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .terms-footer-text {
          font-size: 12px; color: rgba(240,237,232,0.2); font-weight: 300;
        }
        .terms-footer-links { display: flex; gap: 20px; }
        .terms-footer-links a {
          font-size: 12px; color: rgba(240,237,232,0.25);
          border-bottom: none; transition: color 0.2s;
        }
        .terms-footer-links a:hover { color: rgba(240,237,232,0.5); }

        @media (max-width: 768px) {
          .nav { padding: 16px 24px; }
          .hero { padding: 120px 24px 48px; }
          .layout { grid-template-columns: 1fr; padding: 0 24px 80px; gap: 0; }
          .sidebar { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          delegare<span>.</span>
        </Link>
        <Link href="/" className="nav-back">
          ← Back to home
        </Link>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">Legal · Terms of Service</div>
        <h1 className="hero-title">
          Simple rules.
          <br />
          <em>Clearly stated.</em>
        </h1>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <strong>Operated by:</strong> SecureLend, Inc.
          </div>
          <div className="hero-meta-item">
            <strong>Effective:</strong> March 2026
          </div>
          <div className="hero-meta-item">
            <strong>Version:</strong> 1.0
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-label">Contents</div>
          <nav className="sidebar-nav">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`sidebar-link${active === s.id ? " active" : ""}`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* CONTENT */}
        <div className="content">
          {/* 1 — ABOUT */}
          <section id="about" className="policy-section">
            <div className="section-num">Section 1</div>
            <h2>About Delegare</h2>
            <p>
              These Terms of Service ((&quot;Terms&quot;)) govern your use of Delegare, a
              trustless payment authorization layer for AI agents operated by{" "}
              <strong>SecureLend, Inc.</strong>, a Delaware Corporation
              (&quot;SecureLend,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). Delegare is accessible at{" "}
              <code>delegare.dev</code>, <code>delegare.co</code>,{" "}
              <code>api.delegare.dev</code>, <code>app.delegare.dev</code>, and{" "}
              <code>mcp.delegare.dev</code> (collectively, the &quot;Services&quot;).
            </p>
            <p>
              By accessing or using the Services — including setting up a
              spending delegate, registering as a merchant, or installing the{" "}
              <code>@delegare/sdk</code> — you agree to be bound by these Terms
              and our <Link href="/legal/privacy">Privacy Policy</Link>. If you do not
              agree, do not use the Services.
            </p>
            <div className="callout callout-warn">
              <div className="callout-title">
                Separate from SecureLend&apos;s lending platform
              </div>
              <p>
                Delegare is a standalone product operated by SecureLend, Inc.
                These Terms apply only to Delegare. SecureLend&apos;s separate Terms
                of Service govern use of the SecureLend loan origination
                platform.
              </p>
            </div>
            <p>
              <strong>
                Delegare is not a payment processor, bank, or financial
                institution.
              </strong>{" "}
              Delegare provides an authorization and routing layer. Actual
              payment processing is performed by Stripe (fiat) or executed on
              the Base blockchain (crypto). Delegare does not hold, custody, or
              transmit funds.
            </p>
          </section>

          {/* 2 — ACCOUNTS */}
          <section id="accounts" className="policy-section">
            <div className="section-num">Section 2</div>
            <h2>Accounts and Eligibility</h2>

            <h3>Eligibility</h3>
            <p>
              You must be at least 18 years old and capable of entering into a
              binding contract to use Delegare. By using the Services, you
              represent and warrant that you meet these requirements. Delegare
              is not available to users who have been previously suspended or
              removed from the Services.
            </p>

            <h3>Account registration</h3>
            <p>
              Merchant accounts require registration with a valid business email
              address. Spending delegate setup requires a valid email address.
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activity that occurs under your
              account.
            </p>

            <h3>Accurate information</h3>
            <p>
              You agree to provide accurate, current, and complete information
              during registration and to update that information to keep it
              accurate. We reserve the right to suspend or terminate accounts
              based on inaccurate or misleading registration information.
            </p>

            <h3>One account per merchant</h3>
            <p>
              Each merchant may maintain one active merchant account. Creating
              duplicate accounts to circumvent rate limits, fee structures, or
              suspensions is prohibited.
            </p>
          </section>

          {/* 3 — SPENDING DELEGATES */}
          <section id="delegates" className="policy-section">
            <div className="section-num">Section 3</div>
            <h2>Spending Delegates — User Terms</h2>

            <h3>What a spending delegate is</h3>
            <p>
              A spending delegate authorizes an AI agent to initiate payments on
              your behalf, within the limits you set. When you create a spending
              delegate, Delegare issues a <code>DelegateToken</code> to your
              agent. That token authorizes charges up to your configured
              per-transaction and monthly limits at your approved merchants.
            </p>

            <h3>Your responsibility for delegate activity</h3>
            <div className="callout callout-warn">
              <div className="callout-title">
                You are responsible for charges your agent makes
              </div>
              <p>
                All charges made using a valid DelegateToken are your
                responsibility, whether initiated by you, your agent, or any
                third party who obtained your token. Treat your DelegateToken
                like a payment card — keep it secure and revoke it immediately
                if you believe it has been compromised.
              </p>
            </div>

            <h3>Spending limits are enforced, not guaranteed</h3>
            <p>
              Delegare uses atomic enforcement to prevent charges exceeding your
              configured limits. However, in rare cases of infrastructure
              failure, network partition, or other exceptional circumstances, a
              charge may temporarily exceed your limit. In any such case,
              Delegare will make commercially reasonable efforts to identify and
              reverse the excess charge. Delegare&apos;s liability for any such
              overage is limited to the amount of the excess charge.
            </p>

            <h3>Revocation</h3>
            <p>
              You may revoke a spending delegate at any time via the{" "}
              <code>revoke_delegate</code> MCP tool or the Delegare dashboard.
              Revocation takes effect immediately. Charges that have already
              been authorized and are in-flight at the time of revocation may
              still complete. Delegare is not liable for charges that complete
              after revocation is requested but before it is processed.
            </p>

            <h3>Free for users</h3>
            <p>
              Setting up, managing, and revoking a spending delegate is always
              free for users. Delegare charges merchants, not users, for
              transactions.
            </p>

            <h3>No consumer credit</h3>
            <p>
              Delegare does not extend credit. The Services facilitate payment
              of amounts that you owe or have agreed to pay. A spending delegate
              is not a credit facility, overdraft service, or line of credit.
            </p>
          </section>

          {/* 4 — MERCHANT TERMS */}
          <section id="merchants" className="policy-section">
            <div className="section-num">Section 4</div>
            <h2>Merchant Terms</h2>

            <h3>Merchant registration</h3>
            <p>
              To accept agent payments via Delegare, you must register a
              merchant account and receive a merchant ID and API key. By
              registering, you represent that you have the legal authority to
              bind your business to these Terms.
            </p>

            <h3>Permitted use of the SDK</h3>
            <p>
              Merchants may use <code>@delegare/sdk</code> solely to initiate
              legitimate payment charges for goods and services actually
              provided or to be provided to the spending delegate user. You may
              not use the SDK to:
            </p>
            <ul>
              <li>
                Charge amounts that exceed the value of goods or services
                provided
              </li>
              <li>
                Initiate charges without a legitimate commercial transaction
                underlying the charge
              </li>
              <li>
                Process payments on behalf of third-party merchants without
                written permission from SecureLend
              </li>
              <li>
                Circumvent spending limits by splitting a single transaction
                into multiple smaller charges
              </li>
              <li>
                Test charges against real DelegateTokens belonging to users who
                have not consented to test charges
              </li>
            </ul>

            <h3>Idempotency obligation</h3>
            <p>
              Merchants must supply a unique <code>idempotencyKey</code> on
              every charge request. The idempotency key must be unique per
              merchant per transaction. Reusing an idempotency key for a
              different transaction is prohibited and may result in the wrong
              transaction being returned or the charge being rejected.
            </p>

            <h3>Webhook security</h3>
            <p>
              If you configure a webhook URL, you are responsible for validating
              the Delegare signature on all incoming webhook payloads. Delegare
              provides signature verification documentation. Processing
              unverified webhooks and taking action based on them is at your own
              risk.
            </p>

            <h3>API key security</h3>
            <p>
              Your API key authenticates all requests from your integration. You
              are responsible for keeping it confidential. Do not expose your
              API key in client-side code, public repositories, or any
              environment accessible to unauthorized parties. If your API key is
              compromised, rotate it immediately via the Delegare dashboard.
            </p>

            <h3>Merchant compliance</h3>
            <p>
              You are solely responsible for compliance with all laws applicable
              to your business, including consumer protection laws, sales tax
              obligations, export controls, and any regulations applicable to
              your industry or the goods and services you sell. Delegare does
              not provide legal, tax, or compliance advice.
            </p>
          </section>

          {/* 5 — PAYMENTS & FEES */}
          <section id="payments" className="policy-section">
            <div className="section-num">Section 5</div>
            <h2>Payments and Fees</h2>

            <h3>Platform fee</h3>
            <p>
              SecureLend charges merchants a platform fee per successful
              transaction routed through the Delegare platform, according to the
              following schedule:
            </p>
            <ul>
              <li>
                <strong>Transactions of $1.00 or more:</strong> a flat{" "}
                <strong>$0.03 (three cents USD)</strong>.
              </li>
              <li>
                <strong>Transactions under $1.00:</strong>{" "}
                <strong>3% of the transaction amount</strong>, subject to a
                minimum of <strong>$0.005 (one-half cent USD)</strong>.
              </li>
            </ul>
            <p>
              The platform fee is non-refundable once a transaction is marked
              completed.
            </p>

            <div className="callout callout-green">
              <div className="callout-title">Price commitment</div>
              <p>
                The above fee schedule is Delegare&apos;s commitment to simple,
                predictable pricing. We will provide at least 90 days&apos; written
                notice before any change to this schedule. Any fee change will
                not apply to transactions initiated before the effective date of
                the change.
              </p>
            </div>

            <h3>Billing mechanism</h3>
            <p>
              Platform fees are collected via Stripe metered billing on a
              monthly basis. By registering as a merchant, you authorize
              SecureLend to charge your Stripe payment method for platform fees
              accrued during each billing period. Fees are reported to Stripe as
              usage records and billed at the end of each calendar month.
            </p>

            <h3>Failed payments</h3>
            <p>
              If your Stripe billing fails, SecureLend will retry the charge in
              accordance with Stripe&apos;s standard retry schedule. If a billing
              failure remains unresolved for 14 days, SecureLend may suspend
              your merchant account until the outstanding balance is settled.
            </p>

            <h3>Taxes</h3>
            <p>
              You are responsible for all taxes, duties, and similar charges
              arising from your use of the Services and your transactions with
              users, except for taxes on SecureLend&apos;s own income. SecureLend may
              add applicable taxes to platform fees where required by law.
            </p>

            <h3>No fee for users</h3>
            <p>
              Users (spending delegate holders) are never charged platform fees.
              Fees are the merchant&apos;s responsibility.
            </p>
          </section>

          {/* 6 — CRYPTO */}
          <section id="crypto" className="policy-section">
            <div className="section-num">Section 6</div>
            <h2>Crypto Payments and On-Chain Transactions</h2>

            <div className="callout callout-red">
              <div className="callout-title">
                Crypto transactions are irreversible
              </div>
              <p>
                <strong>
                  Transactions executed on the Base blockchain are final and
                  cannot be reversed, cancelled, or recalled by Delegare.
                </strong>{" "}
                Once a USDC or USDT transfer is confirmed on-chain, it cannot be
                undone. If you initiate a crypto payment in error, your only
                recourse is to negotiate a refund directly with the merchant.
                Delegare cannot reverse on-chain transactions.
              </p>
            </div>

            <h3>On-chain data is permanent and public</h3>
            <p>
              Crypto transactions executed through Delegare are recorded on the
              Base blockchain. Transaction amounts, wallet addresses, and
              timestamps are permanently and publicly visible on-chain. This
              data cannot be deleted or modified by Delegare, the merchant, or
              the user. By initiating or accepting a crypto payment, you
              acknowledge and accept this permanent public record.
            </p>

            <h3>Session keys</h3>
            <p>
              For crypto payments, Delegare generates and manages an ERC-4337
              session key scoped exclusively to the Delegare payment contract.
              You authorize SecureLend to generate and use this session key to
              execute transactions on your behalf within your configured
              spending limits. The session key does not grant authority to
              interact with any other smart contract or transfer funds outside
              your pre-authorized parameters.
            </p>

            <h3>Network risks</h3>
            <p>
              Delegare routes crypto transactions over the Base network. Network
              congestion, gas price spikes, smart contract bugs, protocol
              upgrades, and other factors outside Delegare&apos;s control may affect
              transaction execution, timing, or cost. SecureLend is not liable
              for losses arising from network conditions.
            </p>

            <h3>Smart wallet</h3>
            <p>
              Users who connect a smart wallet for crypto payments are solely
              responsible for the security of their master private key and seed
              phrase. SecureLend never requests, receives, stores, or has access
              to your master private key or seed phrase. Loss of your master
              private key may result in permanent loss of access to your wallet
              and any funds it holds. SecureLend cannot recover lost private
              keys.
            </p>

            <h3>Supported assets</h3>
            <p>
              Delegare currently supports USDC and USDT on the Base mainnet.
              Support for additional assets or networks may be added in the
              future. Delegare reserves the right to discontinue support for any
              asset or network with 30 days&apos; notice.
            </p>
          </section>

          {/* 7 — AGENT CONTEXT */}
          <section id="agent" className="policy-section">
            <div className="section-num">Section 7</div>
            <h2>AI Agent Context and Autonomous Payments</h2>

            <h3>Autonomous payment authorization</h3>
            <p>
              Delegare is designed to enable AI agents to initiate payments
              autonomously without requiring user approval for each individual
              transaction. By setting up a spending delegate and providing a
              DelegateToken to your agent, you grant your agent standing
              authorization to initiate payments within your configured limits.
              You accept full responsibility for all charges made by your agent
              using a valid DelegateToken.
            </p>

            <h3>Third-party AI platforms</h3>
            <p>
              Delegare integrates with AI agent platforms (including Claude by
              Anthropic, ChatGPT by OpenAI, and other MCP-compatible platforms)
              via the Model Context Protocol. SecureLend is not affiliated with,
              endorsed by, or responsible for these platforms. Each platform&apos;s
              own terms of service govern your use of that platform. SecureLend
              has no control over how AI platforms handle, store, or process
              DelegateTokens or other data in the agent&apos;s context.
            </p>

            <h3>No guarantee of agent behavior</h3>
            <p>
              SecureLend makes no representations about the behavior,
              reliability, or security of any AI agent or AI platform. You are
              solely responsible for configuring your AI agent appropriately,
              setting suitable spending limits, and monitoring your agent&apos;s
              payment activity. SecureLend is not liable for any charges
              resulting from agent behavior that you did not anticipate or
              intend.
            </p>

            <h3>MCP tool annotations</h3>
            <p>
              Delegare&apos;s MCP tools include annotations indicating that payment
              tools have financial consequences. You acknowledge that AI
              platforms may present confirmation prompts for financial tool
              calls and that bypassing or dismissing such prompts is at your own
              risk.
            </p>
          </section>

          {/* 8 — PROHIBITED */}
          <section id="prohibited" className="policy-section">
            <div className="section-num">Section 8</div>
            <h2>Prohibited Use</h2>
            <p>You may not use Delegare to:</p>
            <ul>
              <li>
                Facilitate or process payments for illegal goods or services
              </li>
              <li>Launder money, finance terrorism, or evade sanctions</li>
              <li>
                Process payments for gambling, adult content, or firearms
                without prior written approval from SecureLend
              </li>
              <li>
                Circumvent, disable, or attack Delegare&apos;s security mechanisms,
                rate limits, or spending enforcement
              </li>
              <li>
                Reverse engineer, decompile, or disassemble the vault service or
                any proprietary component of the Services
              </li>
              <li>
                Attempt to access another user&apos;s delegate records, merchant
                account, or transaction data
              </li>
              <li>
                Use the Services in a way that would subject SecureLend to
                licensing requirements as a money transmitter, payment
                institution, or financial services provider
              </li>
              <li>
                Resell or sublicense access to the Delegare API without written
                permission from SecureLend
              </li>
              <li>
                Use automated scripts, bots, or agents to create fraudulent
                transactions, generate false usage records, or manipulate
                billing
              </li>
              <li>
                Impersonate Delegare, SecureLend, or any legitimate merchant in
                communications with users
              </li>
            </ul>
            <p>
              Violation of any prohibition in this section may result in
              immediate termination of your account and may be reported to
              relevant authorities.
            </p>
          </section>

          {/* 9 — LIABILITY */}
          <section id="liability" className="policy-section">
            <div className="section-num">Section 9</div>
            <h2>Liability and Disclaimers</h2>

            <h3>Services provided &quot;as is&quot;</h3>
            <p>
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY. SECURELEND DOES
              NOT WARRANT THAT THE SERVICES WILL BE ERROR-FREE, SECURE, OR
              AVAILABLE AT ALL TIMES.
            </p>

            <h3>Limitation of liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SECURELEND&apos;S
              TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO
              THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE GREATER OF: (A)
              THE TOTAL PLATFORM FEES PAID BY YOU TO SECURELEND IN THE THREE
              MONTHS PRECEDING THE CLAIM, OR (B) $100 USD.
            </p>
            <p>
              IN NO EVENT WILL SECURELEND BE LIABLE FOR INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST
              PROFITS, LOSS OF DATA, LOSS OF GOODWILL, OR COST OF SUBSTITUTE
              SERVICES, EVEN IF SECURELEND HAS BEEN ADVISED OF THE POSSIBILITY
              OF SUCH DAMAGES.
            </p>

            <h3>Indemnification</h3>
            <p>
              You agree to indemnify, defend, and hold harmless SecureLend, its
              officers, directors, employees, and agents from any claims,
              damages, losses, liabilities, costs, and expenses (including
              reasonable legal fees) arising from: (a) your use of the Services
              in violation of these Terms; (b) your violation of any applicable
              law or third-party rights; (c) any transaction you process through
              Delegare; or (d) any dispute between you and a user or between you
              and a third party.
            </p>

            <h3>Force majeure</h3>
            <p>
              SecureLend is not liable for delays or failures in performance
              resulting from causes beyond our reasonable control, including
              acts of God, internet outages, AWS infrastructure failures, Base
              network outages, regulatory actions, or other circumstances
              outside SecureLend&apos;s reasonable control.
            </p>
          </section>

          {/* 10 — DISPUTES */}
          <section id="disputes" className="policy-section">
            <div className="section-num">Section 10</div>
            <h2>Disputes and Refunds</h2>

            <h3>Merchant-user disputes</h3>
            <p>
              Disputes between merchants and users regarding the underlying
              goods or services are solely between those parties. SecureLend is
              not a party to such disputes and has no obligation to mediate,
              arbitrate, or resolve them. SecureLend may, at its sole
              discretion, provide transaction records to assist in dispute
              resolution but is under no obligation to do so.
            </p>

            <h3>Refund policy</h3>
            <p>
              Merchants may initiate refunds for fiat transactions via{" "}
              <code>POST /v1/payments/:receiptId/refund</code>. Refunds are
              processed via Stripe and are subject to Stripe&apos;s refund timelines
              (typically 5–10 business days). The platform fee is not refunded
              when a transaction is refunded.
            </p>
            <p>
              Crypto transactions cannot be refunded by Delegare. If a merchant
              wishes to refund a crypto transaction, they must do so by
              initiating a separate outbound transfer to the user&apos;s wallet.
              Delegare has no mechanism to reverse on-chain transactions.
            </p>

            <h3>Chargebacks</h3>
            <p>
              Users who initiate chargebacks on fiat transactions through their
              card issuer or bank do so outside the Delegare platform. Merchants
              are responsible for responding to chargebacks in accordance with
              Stripe&apos;s dispute policies. SecureLend will provide transaction
              records to merchants upon request to assist in chargeback
              responses.
            </p>

            <h3>Platform fee disputes</h3>
            <p>
              If you believe a platform fee was charged in error, contact{" "}
              <a href="mailto:billing@delegare.dev">billing@delegare.dev</a>{" "}
              within 30 days of the billing date. We will review and, if the
              error is confirmed, issue a credit to your next billing cycle.
            </p>

            <h3>Arbitration</h3>
            <p>
              Any dispute arising out of or relating to these Terms or the
              Services that cannot be resolved informally shall be resolved by
              binding arbitration under the American Arbitration Association
              Commercial Arbitration Rules, with proceedings conducted in Dover,
              Delaware. You waive any right to participate in class-action
              litigation or class-wide arbitration. This arbitration clause does
              not apply to claims for injunctive relief arising from breach of
              Section 8 (Prohibited Use).
            </p>
          </section>

          {/* 11 — IP */}
          <section id="ip" className="policy-section">
            <div className="section-num">Section 11</div>
            <h2>Intellectual Property</h2>

            <h3>Delegare IP</h3>
            <p>
              All intellectual property in the Services — including the vault
              service, API design, dashboard, brand, and documentation — is
              owned by or licensed to SecureLend, Inc. These Terms do not grant
              you any ownership interest in Delegare or SecureLend intellectual
              property.
            </p>

            <h3>Open source SDK</h3>
            <p>
              The <code>@delegare/sdk</code> and{" "}
              <code>@delegare/mcp-tools</code> packages are licensed under the
              MIT License. The MIT License governs your use of those packages.
              Nothing in these Terms restricts rights granted by the MIT License
              for those specific packages.
            </p>

            <h3>Merchant license</h3>
            <p>
              Subject to these Terms, SecureLend grants merchants a limited,
              non-exclusive, non-transferable, revocable license to use the
              Delegare API and <code>@delegare/sdk</code> solely for the purpose
              of accepting agent-initiated payments from Delegare users. This
              license terminates automatically upon termination of your merchant
              account.
            </p>

            <h3>Feedback</h3>
            <p>
              If you submit feedback, suggestions, or ideas about Delegare, you
              grant SecureLend a perpetual, royalty-free, worldwide license to
              use that feedback without restriction or compensation to you.
            </p>
          </section>

          {/* 12 — TERMINATION */}
          <section id="termination" className="policy-section">
            <div className="section-num">Section 12</div>
            <h2>Termination</h2>

            <h3>Termination by you</h3>
            <p>
              Users may stop using the Services and revoke all spending
              delegates at any time. Merchants may close their account by
              contacting{" "}
              <a href="mailto:support@delegare.dev">support@delegare.dev</a>.
              Outstanding platform fee balances are due at account closure.
            </p>

            <h3>Termination by SecureLend</h3>
            <p>
              SecureLend may suspend or terminate your account at any time, with
              or without notice, if: (a) you breach these Terms; (b) your use of
              the Services creates legal, regulatory, or reputational risk for
              SecureLend; (c) required by law or regulatory authority; or (d)
              you engage in prohibited activities under Section 8.
            </p>
            <p>
              For terminations not related to Terms violations, SecureLend will
              provide at least 30 days&apos; notice where reasonably practicable.
            </p>

            <h3>Effect of termination</h3>
            <p>
              Upon termination: (a) your right to access the Services ceases
              immediately; (b) all active spending delegates are revoked; (c)
              outstanding platform fees become immediately due; (d) transaction
              log records are retained in accordance with the Privacy Policy&apos;s
              retention schedule; (e) Sections 5, 6, 9, 10, 11, and 13 of these
              Terms survive termination.
            </p>
          </section>

          {/* 13 — GOVERNING LAW */}
          <section id="governing" className="policy-section">
            <div className="section-num">Section 13</div>
            <h2>Governing Law and Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware and
              applicable federal law, without regard to conflict of law
              principles. Subject to the arbitration clause in Section 10, you
              consent to the exclusive jurisdiction of the state and federal
              courts located in Dover, Delaware for any disputes not subject to
              arbitration.
            </p>
            <p>
              If you are located outside the United States, local mandatory laws
              may apply in addition to these Terms. Nothing in these Terms
              limits rights you may have under mandatory local consumer
              protection laws.
            </p>
          </section>

          {/* 14 — CHANGES */}
          <section id="changes" className="policy-section">
            <div className="section-num">Section 14</div>
            <h2>Changes to These Terms</h2>
            <p>
              SecureLend may update these Terms from time to time. For material
              changes, we will provide at least 14 days&apos; notice by posting a
              notice on delegare.dev and emailing registered merchants and users
              with an email address on file. Changes to the platform fee require
              at least 90 days&apos; notice as described in Section 5.
            </p>
            <p>
              Your continued use of the Services after the effective date of any
              change constitutes your acceptance of the updated Terms. If you do
              not agree to the updated Terms, you must stop using the Services
              and close your account before the effective date.
            </p>
          </section>

          {/* 15 — CONTACT */}
          <section id="contact" className="policy-section">
            <div className="section-num">Section 15</div>
            <h2>Contact</h2>
            <div className="contact-card">
              <div className="contact-row">
                <div className="contact-label">General</div>
                <div className="contact-value">
                  <a href="mailto:hello@delegare.dev">hello@delegare.dev</a>
                </div>
              </div>
              <div className="contact-row">
                <div className="contact-label">Legal / Terms</div>
                <div className="contact-value">
                  <a href="mailto:legal@securelend.ai">legal@securelend.ai</a>
                </div>
              </div>
              <div className="contact-row">
                <div className="contact-label">Billing disputes</div>
                <div className="contact-value">
                  <a href="mailto:billing@delegare.dev">billing@delegare.dev</a>
                </div>
              </div>
              <div className="contact-row">
                <div className="contact-label">Support</div>
                <div className="contact-value">
                  <a href="mailto:support@delegare.dev">support@delegare.dev</a>
                </div>
              </div>
              <div className="contact-row">
                <div className="contact-label">Mailing address</div>
                <div className="contact-value">
                  SecureLend, Inc. — Attn: Legal (Delegare)
                  <br />8 The Green, Dover, DE 19901, United States
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <div className="terms-footer">
            <div className="terms-footer-text">
              Delegare is a product of SecureLend, Inc., a Delaware Corporation.
              © {new Date().getFullYear()} SecureLend, Inc.
            </div>
            <div className="terms-footer-links">
              <Link href="/legal/privacy">Privacy Policy</Link>
              <a href="https://securelend.ai/legal/terms">SecureLend Terms</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
