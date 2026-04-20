"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "who", label: "Who uses Delegare" },
  { id: "collect", label: "What we collect" },
  { id: "never", label: "What we never store" },
  { id: "token", label: "DelegateToken & agents" },
  { id: "crypto", label: "Crypto & on-chain" },
  { id: "use", label: "How we use data" },
  { id: "share", label: "How we share data" },
  { id: "retention", label: "Retention" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "international", label: "International transfers" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  const [active, setActive] = useState("about");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        return el ? { id: s.id, top: el.getBoundingClientRect().top } : null;
      }).filter((o): o is { id: string; top: number } => Boolean(o));
      const current = offsets.filter((o) => o.top <= 120).pop();
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Serif+Display:ital@0;1&display=swap');
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

        /* HERO */
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
        .hero-meta {
          display: flex; gap: 32px; flex-wrap: wrap;
        }
        .hero-meta-item {
          font-size: 13px; color: rgba(240,237,232,0.35); font-weight: 300;
        }
        .hero-meta-item strong { color: rgba(240,237,232,0.6); font-weight: 500; }

        /* LAYOUT */
        .layout {
          max-width: 1100px; margin: 0 auto;
          padding: 0 48px 120px;
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 64px;
          align-items: start;
        }

        /* SIDEBAR */
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

        /* CONTENT */
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
        strong {
          font-weight: 500; color: rgba(240,237,232,0.8);
        }
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

        /* CALLOUT BOXES */
        .callout {
          border: 1px solid rgba(240,237,232,0.09);
          border-radius: 12px; padding: 24px 28px;
          margin: 24px 0;
          background: rgba(240,237,232,0.02);
        }
        .callout-trust {
          border-color: rgba(126,200,152,0.2);
          background: rgba(126,200,152,0.04);
        }
        .callout-warn {
          border-color: rgba(200,185,154,0.2);
          background: rgba(200,185,154,0.04);
        }
        .callout-title {
          font-size: 13px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 10px;
        }
        .callout-trust .callout-title { color: #7ec898; }
        .callout-warn .callout-title { color: #c8b99a; }
        .callout p { margin-bottom: 8px; font-size: 14px; }
        .callout p:last-child { margin-bottom: 0; }

        /* TABLE */
        .retention-table {
          width: 100%; border-collapse: collapse;
          margin: 20px 0; font-size: 14px;
        }
        .retention-table th {
          text-align: left; padding: 10px 16px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(240,237,232,0.3);
          border-bottom: 1px solid rgba(240,237,232,0.1);
        }
        .retention-table td {
          padding: 12px 16px;
          color: rgba(240,237,232,0.5); font-weight: 300;
          border-bottom: 1px solid rgba(240,237,232,0.05);
          vertical-align: top;
        }
        .retention-table tr:last-child td { border-bottom: none; }
        .retention-table td:first-child { color: rgba(240,237,232,0.75); font-weight: 400; }

        /* CONTACT CARD */
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
        .contact-value { font-size: 14px; color: rgba(240,237,232,0.6); font-weight: 300; }

        /* FOOTER */
        .policy-footer {
          border-top: 1px solid rgba(240,237,232,0.07);
          padding: 32px 0 0;
          margin-top: 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .policy-footer-text {
          font-size: 12px; color: rgba(240,237,232,0.2); font-weight: 300;
        }
        .policy-footer-links { display: flex; gap: 20px; }
        .policy-footer-links a {
          font-size: 12px; color: rgba(240,237,232,0.25);
          border-bottom: none; transition: color 0.2s;
        }
        .policy-footer-links a:hover { color: rgba(240,237,232,0.5); }

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
        <div className="hero-eyebrow">Legal · Privacy Policy</div>
        <h1 className="hero-title">
          Your data.
          <br />
          <em>Handled carefully.</em>
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
          {/* 1 */}
          <section id="about" className="policy-section">
            <div className="section-num">Section 1</div>
            <h2>About This Policy</h2>
            <p>
              Delegare is a trustless payment authorization layer for AI agents,
              operated by <strong>SecureLend, Inc.</strong>, a Delaware
              Corporation (&quot;SecureLend,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). Delegare allows
              users to delegate scoped payment authority to AI agents without
              exposing underlying payment credentials, and allows merchants to
              accept agent-initiated payments.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and
              protect information when you use Delegare at{" "}
              <code>delegare.dev</code>, <code>delegare.co</code>,{" "}
              <code>api.delegare.dev</code>, <code>app.delegare.dev</code>, and{" "}
              <code>mcp.delegare.dev</code> (collectively, the &quot;Services&quot;).
            </p>
            <div className="callout callout-warn">
              <div className="callout-title">Separate from SecureLend</div>
              <p>
                Delegare is a separate product from SecureLend&apos;s loan
                origination platform. This policy applies only to Delegare. If
                you are a user of SecureLend&apos;s lending platform, please see the{" "}
                <a href="https://securelend.ai/legal/privacy">
                  SecureLend Privacy Policy
                </a>
                .
              </p>
            </div>
            <p>
              By using Delegare, you agree to this Privacy Policy. If you do not
              agree, please do not use the Services.
            </p>
          </section>

          {/* 2 */}
          <section id="who" className="policy-section">
            <div className="section-num">Section 2</div>
            <h2>Who Uses Delegare</h2>
            <p>Delegare serves two types of users:</p>
            <ul>
              <li>
                <strong>Spending Delegate Users (&quot;Users&quot;):</strong> Individuals
                who set up a spending delegate to authorize their AI agent to
                make payments on their behalf. Setting up a spending delegate is
                always free.
              </li>
              <li>
                <strong>Merchants:</strong> Businesses and developers who
                integrate Delegare to accept agent-initiated payments via the{" "}
                <code>@delegare/sdk</code>.
              </li>
            </ul>
            <p>
              This policy describes our data practices for both. Where practices
              differ, sections are labelled accordingly.
            </p>
          </section>

          {/* 3 */}
          <section id="collect" className="policy-section">
            <div className="section-num">Section 3</div>
            <h2>What We Collect</h2>

            <h3>3.1 Spending Delegate Users</h3>
            <p>When you set up a spending delegate, we collect:</p>
            <ul>
              <li>
                <strong>Identity:</strong> Email address (used to associate your
                delegate with your account and send receipts). Optional: name if
                provided during setup.
              </li>
              <li>
                <strong>Spending limits:</strong> Maximum per transaction,
                maximum monthly spend, allowed merchant list, rail preference,
                and delegate expiry date.
              </li>
              <li>
                <strong>Fiat payment references:</strong> Stripe Customer ID and
                Payment Method ID (references held by Stripe — we never store
                your card number, CVV, or full bank account details). Last four
                digits and card brand for display only.
              </li>
              <li>
                <strong>Crypto payment references:</strong> Your smart wallet
                address (public blockchain address — not a private key), session
                key address (public address only), and allowed contract
                addresses.
              </li>
              <li>
                <strong>DelegateToken:</strong> A cryptographically signed,
                opaque authorization token issued to your AI agent. Does not
                encode payment credentials.
              </li>
              <li>
                <strong>Usage data:</strong> Monthly spend counter, last used
                timestamp, transaction receipts.
              </li>
              <li>
                <strong>Technical data:</strong> IP address (captured at setup
                and per charge, for fraud detection) and user agent string.
              </li>
            </ul>

            <h3>3.2 Merchants</h3>
            <p>When you register a merchant account, we collect:</p>
            <ul>
              <li>
                <strong>Account information:</strong> Business name, website
                URL, contact email, merchant ID.
              </li>
              <li>
                <strong>Integration configuration:</strong> Webhook URL, allowed
                origins, maximum charge ceiling, rail requirement.
              </li>
              <li>
                <strong>Billing:</strong> Stripe Customer ID and Subscription
                Item ID for metered billing per successful transaction.
                We never store your billing card details directly.
              </li>
              <li>
                <strong>Security:</strong> API key hash (bcrypt — the raw key is
                shown once at creation and is not recoverable by anyone
                including Delegare).
              </li>
              <li>
                <strong>Usage statistics:</strong> Total transaction count and
                total volume (denormalized counters).
              </li>
            </ul>

            <h3>3.3 Transaction Logs</h3>
            <p>
              For every payment executed through Delegare, we create an
              immutable transaction receipt containing: receipt ID, hashed
              delegate reference, merchant ID and name, amount, currency, rail
              used, description, idempotency key, status, Stripe Payment Intent
              ID (fiat) or on-chain transaction hash (crypto), platform fee,
              timestamps, and IP address at time of charge. Transaction logs are
              immutable and cannot be altered after creation.
            </p>

            <h3>3.4 Setup Sessions</h3>
            <p>
              Temporary setup session records are created when you initiate
              delegate setup. They expire automatically after 30 minutes or on
              completion and are then deleted.
            </p>

            <h3>3.5 MCP Interactions</h3>
            <p>
              When an AI agent interacts with Delegare via the MCP server at{" "}
              <code>mcp.delegare.dev</code>, we receive the tool call parameters
              sent by the agent (DelegateToken, requested amount, currency,
              merchant ID). We do not receive or log the broader contents of the
              agent&apos;s conversation.
            </p>
          </section>

          {/* 4 */}
          <section id="never" className="policy-section">
            <div className="section-num">Section 4</div>
            <h2>What We Never Store</h2>
            <div className="callout callout-trust">
              <div className="callout-title">The trustless guarantee</div>
              <p>
                The following are never transmitted to or stored by Delegare
                under any circumstances:
              </p>
            </div>
            <ul>
              <li>
                <strong>
                  Card numbers, CVV codes, or full bank account details
                </strong>{" "}
                — held exclusively by Stripe
              </li>
              <li>
                <strong>Crypto private keys or seed phrases</strong> — your
                master private key never leaves your wallet
              </li>
              <li>
                <strong>
                  Session key private keys in DynamoDB or application logs
                </strong>{" "}
                — stored exclusively in AWS Secrets Manager, accessed only at
                transaction execution time, then discarded from memory
              </li>
              <li>
                <strong>Passwords</strong> — Delegare does not use
                password-based authentication for spending delegate setup
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section id="token" className="policy-section">
            <div className="section-num">Section 5</div>
            <h2>The DelegateToken and Agent Context</h2>
            <p>
              When you complete spending delegate setup, Delegare issues a
              DelegateToken to your AI agent. This section describes important
              properties of that token.
            </p>

            <h3>What it contains</h3>
            <p>
              The DelegateToken is an HMAC-SHA256 signed token encoding your
              owner ID and expiry date. It does not encode your card number,
              wallet seed, session key private key, or any other payment
              credential.
            </p>

            <h3>What it authorizes</h3>
            <p>
              Presenting a valid DelegateToken to the Delegare vault API
              authorizes a payment request, subject to the spending limits and
              merchant restrictions you configured. The token is validated
              against the DelegateToken record in our database on every use.
            </p>

            <h3>Where it lives</h3>
            <p>
              The DelegateToken is returned to your AI agent via the MCP tool
              response and is held in your agent&apos;s context window or memory
              system.
            </p>
            <div className="callout callout-warn">
              <div className="callout-title">Agent platform responsibility</div>
              <p>
                <strong>
                  Delegare does not control how your AI agent framework stores,
                  logs, or handles data in its context.
                </strong>{" "}
                Review the privacy policy of your AI platform — for example,{" "}
                <a
                  href="https://anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Anthropic&apos;s policy for Claude
                </a>{" "}
                or{" "}
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenAI&apos;s policy for ChatGPT
                </a>{" "}
                — to understand how tool-returned data is handled within that
                platform.
              </p>
            </div>

            <h3>Token security</h3>
            <p>
              Even if a DelegateToken is obtained by an unauthorized party, it
              can only be used to initiate charges within your pre-configured
              spending limits and only at merchants on your allowed list. It
              cannot be used to retrieve your underlying card details or wallet
              credentials.
            </p>

            <h3>Revocation</h3>
            <p>
              You can revoke a DelegateToken at any time via the{" "}
              <code>revoke_delegate</code> MCP tool or the Delegare dashboard.
              Once revoked, the token is immediately invalid.
            </p>
          </section>

          {/* 6 */}
          <section id="crypto" className="policy-section">
            <div className="section-num">Section 6</div>
            <h2>Crypto Payments and On-Chain Data</h2>

            <h3>On-chain permanence</h3>
            <p>
              Crypto transactions are executed on the Base blockchain (a public
              Ethereum Layer 2 network). The following information is{" "}
              <strong>permanently and publicly visible on-chain</strong> and
              cannot be deleted: transaction hash, sending wallet address (your
              smart wallet), receiving wallet address, amount, token type
              (USDC/USDT), and timestamp.
            </p>

            <h3>Session keys</h3>
            <p>
              Delegare generates an ERC-4337 session key to sign transactions on
              your behalf. The session key is scoped exclusively to the Delegare
              payment contract address and cannot be used to interact with any
              other contract or transfer funds outside your pre-authorized
              spending limits. The session key private key is stored in AWS
              Secrets Manager, fetched at transaction execution time, and is
              never written to application logs or DynamoDB.
            </p>

            <h3>Base network</h3>
            <p>
              Base is operated by Coinbase. Use of the Base network is subject
              to Coinbase&apos;s terms and Ethereum&apos;s underlying protocol. Delegare
              does not control the Base network or on-chain data.
            </p>
          </section>

          {/* 7 */}
          <section id="use" className="policy-section">
            <div className="section-num">Section 7</div>
            <h2>How We Use Your Information</h2>
            <p>We use the information described in Section 3 to:</p>
            <ul>
              <li>
                <strong>Execute and verify payments:</strong> Validate
                DelegateTokens, enforce spending limits, route payments to the
                correct rail, and create immutable receipts
              </li>
              <li>
                <strong>Prevent fraud and abuse:</strong> Detect anomalous
                transaction patterns, block SSRF attempts, enforce rate limits,
                and maintain vault security
              </li>
              <li>
                <strong>Operate the merchant platform:</strong> Manage accounts,
                collect the platform fee via Stripe metered billing,
                deliver webhook notifications
              </li>
              <li>
                <strong>Deliver receipts:</strong> Send transaction receipts to
                users by email where an address is on file
              </li>
              <li>
                <strong>Improve the service:</strong> Analyze aggregate,
                anonymized transaction data to improve routing, reliability, and
                performance
              </li>
              <li>
                <strong>Comply with legal obligations:</strong> Maintain
                transaction records as required by applicable law, respond to
                lawful requests
              </li>
            </ul>
            <p>
              We do not use your data for advertising. We do not sell your data
              to third parties. We do not use your transaction data to train AI
              models for other products.
            </p>
          </section>

          {/* 8 */}
          <section id="share" className="policy-section">
            <div className="section-num">Section 8</div>
            <h2>How We Share Your Information</h2>
            <ul>
              <li>
                <strong>Stripe:</strong> Fiat payment execution requires sharing
                your Stripe Customer ID and Payment Method ID with Stripe, Inc.{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe&apos;s Privacy Policy
                </a>{" "}
                governs their handling of this data.
              </li>
              <li>
                <strong>Coinbase / Base:</strong> Crypto payments are published
                to the public Base blockchain.{" "}
                <a
                  href="https://coinbase.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Coinbase&apos;s Privacy Policy
                </a>{" "}
                governs any data they receive.
              </li>
              <li>
                <strong>Merchants:</strong> When your agent initiates a payment,
                the merchant receives: transaction amount, currency,
                description, idempotency key, receipt ID, and confirmation of
                success. The merchant does not receive your DelegateToken, card
                details, wallet credentials, or email address.
              </li>
              <li>
                <strong>AWS:</strong> Delegare&apos;s infrastructure runs on Amazon
                Web Services in us-east-2. Data is stored in DynamoDB with
                customer-managed KMS encryption.
              </li>
              <li>
                <strong>Legal requests:</strong> We may disclose information
                where required by law, valid legal process, or to protect the
                rights, property, or safety of SecureLend, users, merchants, or
                the public. Where legally permitted, we will notify affected
                users before disclosing.
              </li>
              <li>
                <strong>Business transfers:</strong> In a merger, acquisition,
                or sale of assets, Delegare user and merchant data may transfer
                as part of that transaction. We will provide notice and describe
                available privacy choices.
              </li>
            </ul>
            <p>
              We do not share your information with third parties for their own
              marketing purposes.
            </p>
          </section>

          {/* 9 */}
          <section id="retention" className="policy-section">
            <div className="section-num">Section 9</div>
            <h2>Data Retention</h2>
            <table className="retention-table">
              <thead>
                <tr>
                  <th>Data type</th>
                  <th>Retention period</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Spending delegate records", "Until revoked, then 90 days"],
                  [
                    "Transaction logs (receipts)",
                    "7 years (financial record-keeping)",
                  ],
                  ["Setup sessions", "30 minutes (auto-deleted)"],
                  ["Merchant accounts", "Duration of relationship + 7 years"],
                  ["API key hashes", "Duration of relationship"],
                  ["IP address logs", "90 days"],
                  [
                    "Session key private keys (Secrets Manager)",
                    "Duration of delegate + 30 days",
                  ],
                  ["Stripe Customer IDs", "Until delegate revoked + 90 days"],
                ].map(([type, period]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>{period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              On-chain crypto transactions are permanent and cannot be deleted
              by Delegare or anyone else.
            </p>
            <p>
              When data is deleted, we use cryptographic erasure of KMS
              encryption keys and secure deletion procedures. Deletion from
              backups occurs within 180 days of primary deletion.
            </p>
          </section>

          {/* 10 */}
          <section id="security" className="policy-section">
            <div className="section-num">Section 10</div>
            <h2>Security</h2>
            <p>
              Delegare&apos;s vault infrastructure is operated by SecureLend, Inc.
              under the same security program that governs SecureLend&apos;s SOC 2
              Type 2 certified lending platform. Key measures include:
            </p>
            <ul>
              <li>
                <strong>Encryption in transit:</strong> TLS 1.3 on all API
                endpoints
              </li>
              <li>
                <strong>Encryption at rest:</strong> AES-256 via
                customer-managed AWS KMS keys on all DynamoDB tables
              </li>
              <li>
                <strong>Secrets management:</strong> AWS Secrets Manager for
                session key private keys — never stored in DynamoDB or logs
              </li>
              <li>
                <strong>SSRF protection:</strong> All outbound vault requests
                are blocked to RFC 1918 addresses, the AWS metadata endpoint
                (169.254.169.254), and localhost
              </li>
              <li>
                <strong>Idempotency:</strong> Duplicate charge attempts within
                24 hours return the original receipt — no double-charges
              </li>
              <li>
                <strong>Atomic limit enforcement:</strong> DynamoDB conditional
                writes prevent race conditions under concurrent requests
              </li>
              <li>
                <strong>API key security:</strong> Merchant API keys stored as
                bcrypt hashes only — raw keys are shown once and are not
                recoverable
              </li>
            </ul>
            <p>
              No system is completely secure. You are responsible for revoking
              your DelegateToken promptly if you believe it has been
              compromised.
            </p>
          </section>

          {/* 11 */}
          <section id="rights" className="policy-section">
            <div className="section-num">Section 11</div>
            <h2>Your Privacy Rights</h2>
            <p>
              To exercise any of the following rights, contact us at{" "}
              <a href="mailto:privacy@delegare.dev">privacy@delegare.dev</a>. We
              respond within 30 days.
            </p>

            <h3>All users</h3>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal data we
                hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your data — note
                that transaction logs are retained 7 years for financial
                record-keeping and cannot be deleted early
              </li>
              <li>
                <strong>Revocation:</strong> Revoke a spending delegate at any
                time via the <code>revoke_delegate</code> MCP tool or the
                Delegare dashboard
              </li>
            </ul>

            <h3>California residents (CCPA/CPRA)</h3>
            <ul>
              <li>
                Right to know what personal information we have collected and
                how it is used
              </li>
              <li>
                Right to delete (subject to exceptions for transaction records)
              </li>
              <li>Right to correct inaccurate information</li>
              <li>
                Right to opt out of sale or sharing —{" "}
                <strong>
                  we do not sell or share personal information for advertising
                </strong>
              </li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h3>EEA, UK, and Swiss residents (GDPR)</h3>
            <ul>
              <li>Right of access, rectification, and erasure</li>
              <li>Right to restriction of processing and data portability</li>
              <li>
                Right to object to processing based on legitimate interests
              </li>
              <li>
                Right to lodge a complaint with your local supervisory authority
              </li>
            </ul>

            <div className="callout callout-warn">
              <div className="callout-title">On-chain data</div>
              <p>
                Crypto transaction data recorded on the Base blockchain is
                outside Delegare&apos;s control and cannot be deleted pursuant to any
                rights request.
              </p>
            </div>
          </section>

          {/* 12 */}
          <section id="children" className="policy-section">
            <div className="section-num">Section 12</div>
            <h2>Children&apos;s Privacy</h2>
            <p>
              Delegare is not directed to anyone under 18. We do not knowingly
              collect personal information from anyone under 18. If you believe
              a child has used Delegare, contact us at{" "}
              <a href="mailto:privacy@delegare.dev">privacy@delegare.dev</a> and
              we will delete the relevant data promptly.
            </p>
          </section>

          {/* 13 */}
          <section id="international" className="policy-section">
            <div className="section-num">Section 13</div>
            <h2>International Data Transfers</h2>
            <p>
              Delegare&apos;s infrastructure is hosted in the United States (AWS
              us-east-2). If you access Delegare from outside the United States,
              your data is transferred to and processed in the United States.
            </p>
            <p>
              For users in the EEA, UK, or Switzerland, we rely on Standard
              Contractual Clauses (SCCs) for transfers of personal data outside
              the EEA. A copy of the applicable SCCs is available on request at{" "}
              <a href="mailto:privacy@delegare.dev">privacy@delegare.dev</a>.
            </p>
          </section>

          {/* 14 */}
          <section id="changes" className="policy-section">
            <div className="section-num">Section 14</div>
            <h2>Changes to This Policy</h2>
            <p>
              For material changes we will update the Effective Date, post a
              notice on delegare.dev at least 14 days before changes take
              effect, and email registered merchants and users with an address
              on file.
            </p>
            <p>
              Your continued use of Delegare after the effective date of a
              change constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 15 */}
          <section id="contact" className="policy-section">
            <div className="section-num">Section 15</div>
            <h2>Contact</h2>
            <div className="contact-card">
              <div className="contact-row">
                <div className="contact-label">Privacy questions</div>
                <div className="contact-value">
                  <a href="mailto:privacy@delegare.dev">privacy@delegare.dev</a>
                </div>
              </div>
              <div className="contact-row">
                <div className="contact-label">DPO (EEA/UK/Swiss)</div>
                <div className="contact-value">
                  <a href="mailto:dpo@securelend.ai">dpo@securelend.ai</a>
                </div>
              </div>
              <div className="contact-row">
                <div className="contact-label">Response time</div>
                <div className="contact-value">Within 30 days</div>
              </div>
              <div className="contact-row">
                <div className="contact-label">Mailing address</div>
                <div className="contact-value">
                  SecureLend, Inc. — Attn: Privacy Officer (Delegare)
                  <br />8 The Green, Dover, DE 19901, United States
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <div className="policy-footer">
            <div className="policy-footer-text">
              Delegare is a product of SecureLend, Inc., a Delaware Corporation.
              © {new Date().getFullYear()} SecureLend, Inc.
            </div>
            <div className="policy-footer-links">
              <Link href="/legal/terms">Terms of Service</Link>
              <a href="https://securelend.ai/legal/privacy">
                SecureLend Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
