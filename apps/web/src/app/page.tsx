"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardUrl =
    process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.delegare.dev";

  return (
    <main
      style={{
        background: "#0c0c0c",
        color: "#f0ede8",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 48px;
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
          font-size: 22px;
          color: #f0ede8;
          text-decoration: none;
          letter-spacing: -0.3px;
        }
        .nav-logo span { color: #c8b99a; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link {
          font-size: 14px; font-weight: 400; color: rgba(240,237,232,0.55);
          text-decoration: none; transition: color 0.2s; letter-spacing: 0.01em;
        }
        .nav-link:hover { color: #f0ede8; }
        .nav-cta {
          font-size: 13px; font-weight: 500;
          background: #f0ede8; color: #0c0c0c;
          padding: 8px 20px; border-radius: 100px;
          text-decoration: none; transition: opacity 0.2s;
          letter-spacing: 0.01em;
        }
        .nav-cta:hover { opacity: 0.85; }

        /* HERO */
        .hero {
          padding: 180px 48px 120px;
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: start;
        }
        .hero-left { display: flex; flex-direction: column; gap: 32px; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: #c8b99a;
          border: 1px solid rgba(200,185,154,0.25);
          padding: 6px 14px; border-radius: 100px;
          width: fit-content;
        }
        .hero-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #c8b99a; animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hero-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(44px, 5vw, 64px);
          line-height: 1.05; letter-spacing: -1px;
          color: #f0ede8;
          animation: fadeUp 0.8s ease both;
        }
        .hero-heading em { font-style: italic; color: #c8b99a; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-sub {
          font-size: 17px; line-height: 1.65; color: rgba(240,237,232,0.55);
          font-weight: 300; max-width: 440px;
          animation: fadeUp 0.8s 0.1s ease both;
        }
        .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: fadeUp 0.8s 0.2s ease both;
        }
        .btn-primary {
          font-size: 14px; font-weight: 500;
          background: #f0ede8; color: #0c0c0c;
          padding: 12px 28px; border-radius: 100px;
          text-decoration: none; transition: opacity 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-secondary {
          font-size: 14px; font-weight: 400;
          color: rgba(240,237,232,0.65);
          padding: 12px 28px; border-radius: 100px;
          text-decoration: none; transition: color 0.2s;
          border: 1px solid rgba(240,237,232,0.12);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-secondary:hover { color: #f0ede8; border-color: rgba(240,237,232,0.25); }
        .btn-merchant {
          font-size: 14px; font-weight: 400;
          color: #7ec898;
          padding: 12px 28px; border-radius: 100px;
          text-decoration: none; transition: color 0.2s, border-color 0.2s;
          border: 1px solid rgba(126,200,152,0.25);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-merchant:hover { color: #a0ddb5; border-color: rgba(126,200,152,0.45); }

        /* HERO RIGHT — dual audience cards */
        .hero-right {
          display: flex; flex-direction: column; gap: 16px;
          padding-top: 32px;
          animation: fadeUp 0.8s 0.2s ease both;
        }
        .audience-card {
          border: 1px solid rgba(240,237,232,0.09);
          border-radius: 16px; padding: 28px 32px;
          background: rgba(240,237,232,0.03);
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .audience-card:hover {
          border-color: rgba(240,237,232,0.16);
          background: rgba(240,237,232,0.05);
        }
        .audience-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 14px;
          display: inline-block; padding: 4px 10px;
          border-radius: 100px;
        }
        .tag-user { background: rgba(200,185,154,0.12); color: #c8b99a; }
        .tag-merchant { background: rgba(120,180,140,0.12); color: #7ec898; }
        .audience-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: #f0ede8;
          line-height: 1.2; margin-bottom: 10px;
        }
        .audience-body {
          font-size: 14px; line-height: 1.6;
          color: rgba(240,237,232,0.5); font-weight: 300;
          margin-bottom: 18px;
        }
        .audience-link {
          font-size: 13px; font-weight: 500;
          color: rgba(240,237,232,0.55); text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 14px; transition: color 0.2s;
        }
        .audience-link:hover { color: #f0ede8; }

        /* SOCIAL PROOF */
        .social-proof {
          max-width: 1100px; margin: 0 auto;
          padding: 0 48px 60px;
          display: flex; align-items: center; justify-content: center;
          gap: 48px; flex-wrap: wrap;
          animation: fadeUp 0.8s 0.4s ease both;
        }
        .proof-label {
          font-size: 11px; font-weight: 400; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(240,237,232,0.2);
        }
        .proof-badge {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: rgba(240,237,232,0.35);
          font-weight: 400;
        }
        .proof-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }

        /* DIVIDER */
        .section-divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(240,237,232,0.08) 30%, rgba(240,237,232,0.08) 70%, transparent);
          max-width: 1100px; margin: 0 auto;
        }

        /* HOW IT WORKS */
        .section {
          padding: 100px 48px;
          max-width: 1100px; margin: 0 auto;
        }
        .section-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(240,237,232,0.3);
          margin-bottom: 48px;
        }
        .flow-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 2px; border: 1px solid rgba(240,237,232,0.07);
          border-radius: 16px; overflow: hidden;
        }
        .flow-step {
          padding: 36px 28px;
          background: rgba(240,237,232,0.02);
          border-right: 1px solid rgba(240,237,232,0.07);
          transition: background 0.2s;
          position: relative;
        }
        .flow-step:last-child { border-right: none; }
        .flow-step:hover { background: rgba(240,237,232,0.04); }
        .flow-num {
          font-family: 'DM Serif Display', serif;
          font-size: 42px; color: rgba(240,237,232,0.08);
          line-height: 1; margin-bottom: 16px;
        }
        .flow-title {
          font-size: 15px; font-weight: 500;
          color: #f0ede8; margin-bottom: 8px;
        }
        .flow-body {
          font-size: 13px; line-height: 1.6;
          color: rgba(240,237,232,0.4); font-weight: 300;
        }

        /* TRUST SECTION */
        .rails-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-top: 48px;
        }
        .rail-card {
          border: 1px solid rgba(240,237,232,0.08);
          border-radius: 16px; padding: 40px;
          background: rgba(240,237,232,0.02);
          transition: border-color 0.2s;
        }
        .rail-card:hover { border-color: rgba(240,237,232,0.14); }
        .rail-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 20px;
        }
        .rail-icon-fiat { background: rgba(200,185,154,0.1); }
        .rail-icon-crypto { background: rgba(120,180,140,0.1); }
        .rail-name {
          font-family: 'DM Serif Display', serif;
          font-size: 26px; color: #f0ede8; margin-bottom: 10px;
        }
        .rail-desc {
          font-size: 14px; line-height: 1.6;
          color: rgba(240,237,232,0.45); font-weight: 300;
        }

        /* RAILS SECTION */
        .dual-rails {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-top: 48px;
        }
        .dual-rail-card {
          border: 1px solid rgba(240,237,232,0.08);
          border-radius: 16px; padding: 40px;
          background: rgba(240,237,232,0.02);
          transition: border-color 0.2s;
        }
        .dual-rail-card:hover { border-color: rgba(240,237,232,0.14); }
        .dual-rail-title {
          font-family: 'DM Serif Display', serif;
          font-size: 24px; color: #f0ede8; margin-bottom: 10px;
        }
        .dual-rail-desc {
          font-size: 14px; line-height: 1.6;
          color: rgba(240,237,232,0.45); font-weight: 300;
          margin-bottom: 24px;
        }
        .dual-rail-props { display: flex; flex-direction: column; gap: 10px; }
        .dual-rail-prop {
          display: flex; align-items: center; gap: 12px;
          font-size: 13px; color: rgba(240,237,232,0.5);
        }
        .dual-rail-check { color: #c8b99a; font-size: 11px; }

        /* PRICING */
        .pricing-block {
          margin-top: 48px;
          border: 1px solid rgba(240,237,232,0.08);
          border-radius: 20px; padding: 60px;
          background: rgba(240,237,232,0.02);
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center;
        }
        .pricing-left {}
        .pricing-big {
          font-family: 'DM Serif Display', serif;
          font-size: 96px; color: #f0ede8;
          line-height: 1; letter-spacing: -3px;
          margin-bottom: 8px;
        }
        .pricing-big span { color: #c8b99a; }
        .pricing-forever {
          font-size: 14px; color: rgba(240,237,232,0.4);
          font-weight: 300; margin-bottom: 32px;
        }
        .pricing-context {
          display: flex; flex-direction: column; gap: 14px; margin-top: 4px;
        }
        .pricing-context-line {
          font-size: 14px; line-height: 1.65;
          color: rgba(240,237,232,0.5); font-weight: 300;
        }
        .pricing-context-note {
          font-size: 12px; line-height: 1.6;
          color: rgba(240,237,232,0.25); font-weight: 300;
          padding-top: 8px;
          border-top: 1px solid rgba(240,237,232,0.07);
        }
        .pricing-right {
          display: flex; flex-direction: column; gap: 20px;
        }
        .pricing-feature {
          display: flex; gap: 16px; align-items: flex-start;
        }
        .pricing-feature-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(240,237,232,0.04);
          border: 1px solid rgba(240,237,232,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }
        .pricing-feature-text {}
        .pricing-feature-title {
          font-size: 14px; font-weight: 500;
          color: #f0ede8; margin-bottom: 4px;
        }
        .pricing-feature-desc {
          font-size: 13px; color: rgba(240,237,232,0.4);
          font-weight: 300; line-height: 1.5;
        }

        /* CODE SNIPPET */
        .code-block {
          margin-top: 48px;
          background: #111;
          border: 1px solid rgba(240,237,232,0.08);
          border-radius: 16px; overflow: hidden;
        }
        .code-header {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(240,237,232,0.07);
          display: flex; align-items: center; gap: 10px;
        }
        .code-dot { width: 10px; height: 10px; border-radius: 50%; }
        .code-tab {
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(240,237,232,0.25);
          margin-left: auto;
        }
        .code-body { padding: 28px 28px; font-family: 'DM Mono', 'Fira Code', monospace; font-size: 13px; line-height: 1.9; }
        .c-dim { color: rgba(240,237,232,0.2); }
        .c-green { color: #7ec898; }
        .c-gold { color: #c8b99a; }
        .c-blue { color: #89b4e8; }
        .c-white { color: #f0ede8; }

        /* CTA BANNER */
        .cta-banner {
          margin-top: 48px;
          border: 1px solid rgba(200,185,154,0.15);
          border-radius: 20px; padding: 60px;
          background: linear-gradient(135deg, rgba(200,185,154,0.04) 0%, rgba(126,200,152,0.04) 100%);
          text-align: center;
        }
        .cta-banner-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 36px; color: #f0ede8;
          margin-bottom: 16px;
        }
        .cta-banner-sub {
          font-size: 16px; color: rgba(240,237,232,0.5);
          font-weight: 300; margin-bottom: 32px;
          max-width: 500px; margin-left: auto; margin-right: auto;
          line-height: 1.6;
        }
        .cta-banner-actions {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(240,237,232,0.07);
          padding: 48px;
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 18px; color: rgba(240,237,232,0.4);
        }
        .footer-logo span { color: rgba(200,185,154,0.5); }
        .footer-links { display: flex; gap: 28px; }
        .footer-link {
          font-size: 13px; color: rgba(240,237,232,0.3);
          text-decoration: none; transition: color 0.2s;
        }
        .footer-link:hover { color: rgba(240,237,232,0.6); }
        .footer-free {
          font-size: 12px; color: rgba(240,237,232,0.2);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .nav { padding: 16px 24px; }
          .hero { grid-template-columns: 1fr; padding: 140px 24px 80px; gap: 48px; }
          .section { padding: 72px 24px; }
          .flow-grid { grid-template-columns: 1fr 1fr; }
          .rails-grid { grid-template-columns: 1fr; }
          .dual-rails { grid-template-columns: 1fr; }
          .pricing-block { grid-template-columns: 1fr; gap: 40px; padding: 40px 28px; }
          .pricing-big { font-size: 72px; }
          .social-proof { gap: 24px; padding: 0 24px 48px; }
          .cta-banner { padding: 40px 28px; }
          .cta-banner-heading { font-size: 28px; }
          .footer { flex-direction: column; gap: 24px; align-items: flex-start; padding: 40px 24px; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          delegare<span>.</span>
        </Link>
        <div className="nav-links">
          <a href="https://docs.delegare.dev" className="nav-link">
            Docs
          </a>
          <a href="https://github.com/delegare/delegare" className="nav-link">
            GitHub
          </a>
          <a href={dashboardUrl} className="nav-cta">
            Sign in
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            The payment layer for AI agents
          </div>
          <h1 className="hero-heading">
            Let AI agents pay for things—<em>safely.</em>
          </h1>
          <p className="hero-sub">
            Give agents real spending power with hard limits they
            can&apos;t override. Users set the rules. Agents execute.
            Merchants get paid. From 3&cent; per transaction.
          </p>
          <div className="hero-actions">
            <a
              href={`${dashboardUrl}/onboarding?type=buyer`}
              className="btn-primary"
            >
              Get started free
            </a>
            <a
              href={`${dashboardUrl}/onboarding?type=merchant`}
              className="btn-merchant"
            >
              Integrate as a merchant
            </a>
            <a href="https://docs.delegare.dev" className="btn-secondary">
              Read the docs
            </a>
          </div>
        </div>

        <div className="hero-right">
          {/* BUYER CARD */}
          <div className="audience-card">
            <span className="audience-tag tag-user">For Buyers</span>
            <div className="audience-title">Your agent orders dinner.</div>
            <p className="audience-body">
              You set a $30 food budget. Your agent finds a restaurant,
              places the order, and pays — automatically. You stay in control.
              It can never spend more than you approved.
            </p>
            <a
              href={`${dashboardUrl}/setup?ref=card`}
              className="audience-link"
            >
              Set up your spending delegate &rarr;
            </a>
          </div>

          {/* MERCHANT CARD */}
          <div className="audience-card">
            <span className="audience-tag tag-merchant">For Merchants</span>
            <div className="audience-title">Accept payments from any AI agent.</div>
            <p className="audience-body">
              Add 5 lines of code. When an agent hits your API, Delegare
              handles authentication, spending validation, and settlement — via
              Stripe or USDC on Base. You get paid; they get access.
            </p>
            <a href="https://docs.delegare.dev/quickstart" className="audience-link">
              See the integration guide &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="social-proof">
        <span className="proof-label">Built on</span>
        <span className="proof-badge">
          <span className="proof-badge-dot" style={{ background: "#635BFF" }} />
          Stripe
        </span>
        <span className="proof-badge">
          <span className="proof-badge-dot" style={{ background: "#0052FF" }} />
          Base (Coinbase L2)
        </span>
        <span className="proof-badge">
          <span className="proof-badge-dot" style={{ background: "#2775CA" }} />
          USDC
        </span>
        <span className="proof-badge">
          <span className="proof-badge-dot" style={{ background: "#FF9900" }} />
          AWS
        </span>
      </div>

      <div className="section-divider" />

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-label">How it works</div>
        <div className="flow-grid">
          {[
            {
              n: "01",
              title: "User sets the rules",
              body: "Connect a card or crypto wallet. Set a monthly cap, per-transaction limit, and which merchants are allowed. Takes 60 seconds.",
            },
            {
              n: "02",
              title: "Agent gets a mandate",
              body: "Your agent receives a signed spending mandate — a cryptographic credential that proves what it's allowed to spend, with whom, and how much.",
            },
            {
              n: "03",
              title: "Agent pays autonomously",
              body: "When it's time to pay, the agent presents the mandate to Delegare. Limits are validated atomically. The payment executes on Stripe or Base.",
            },
            {
              n: "04",
              title: "Everyone gets a receipt",
              body: "The merchant gets paid instantly. You get an immutable receipt. The mandate balance updates. Your card number is never exposed.",
            },
          ].map((s) => (
            <div key={s.n} className="flow-step">
              <div className="flow-num">{s.n}</div>
              <div className="flow-title">{s.title}</div>
              <div className="flow-body">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* TRUST */}
      <section className="section">
        <div className="section-label">Built for trust</div>
        <p
          style={{
            textAlign: "center",
            color: "rgba(240,237,232,0.6)",
            maxWidth: 650,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          People are rightfully skeptical when money is involved. Delegare is
          built on strict boundaries and cryptographic guarantees so your agent
          can never go rogue.
        </p>
        <div className="rails-grid">
          <div className="rail-card">
            <div className="rail-icon rail-icon-crypto">
              <span role="img" aria-label="shield">&#x1F6E1;&#xFE0F;</span>
            </div>
            <div className="rail-name">Hard Spend Limits</div>
            <p className="rail-desc">
              Atomic server-side counters enforce your budget to the cent. If
              your limit is $10, the agent cannot spend $10.01 — even under
              concurrent requests. Race conditions are mathematically
              impossible.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-fiat">
              <span role="img" aria-label="lock">&#x1F512;</span>
            </div>
            <div className="rail-name">Zero Credential Exposure</div>
            <p className="rail-desc">
              Agents never see your card number, private keys, or seed phrase.
              They hold a signed <em>spending mandate</em> — a scoped,
              revocable credential that proves what they&apos;re allowed to
              spend. Nothing more.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-fiat">
              <span role="img" aria-label="check">&#x2705;</span>
            </div>
            <div className="rail-name">Merchant Allowlists</div>
            <p className="rail-desc">
              Every mandate is locked to the merchants you explicitly approve.
              A mandate authorized for an API provider cannot be used at a
              pizza shop. The agent has no way to circumvent this.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-crypto">
              <span role="img" aria-label="clock">&#x23F3;</span>
            </div>
            <div className="rail-name">Auto-Expiration &amp; Revocation</div>
            <p className="rail-desc">
              Mandates have a strict time-to-live and expire automatically. You
              can also revoke any active mandate instantly from your dashboard
              — the agent&apos;s access is killed in under a second.
            </p>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* PAYMENT RAILS */}
      <section className="section">
        <div className="section-label">Payment rails</div>
        <p
          style={{
            textAlign: "center",
            color: "rgba(240,237,232,0.6)",
            maxWidth: 580,
            margin: "0 auto 0",
            lineHeight: 1.6,
          }}
        >
          One integration, two settlement options. Delegare handles the
          authorization layer — you keep your existing payment stack.
        </p>
        <div className="dual-rails">
          <div className="dual-rail-card">
            <div
              className="rail-icon rail-icon-fiat"
              style={{ marginBottom: 20 }}
            >
              &#x1F4B3;
            </div>
            <div className="dual-rail-title">Fiat via Stripe</div>
            <p className="dual-rail-desc">
              Credit cards, debit cards, and bank accounts. Settle in 190+
              countries with Stripe Connect.
            </p>
            <div className="dual-rail-props">
              <div className="dual-rail-prop">
                <span className="dual-rail-check">&#x2713;</span> Stripe
                Connect onboarding
              </div>
              <div className="dual-rail-prop">
                <span className="dual-rail-check">&#x2713;</span> 135+
                currencies
              </div>
              <div className="dual-rail-prop">
                <span className="dual-rail-check">&#x2713;</span> PCI DSS
                compliant
              </div>
            </div>
          </div>
          <div className="dual-rail-card">
            <div
              className="rail-icon rail-icon-crypto"
              style={{ marginBottom: 20 }}
            >
              &#x26D3;&#xFE0F;
            </div>
            <div className="dual-rail-title">Crypto on Base</div>
            <p className="dual-rail-desc">
              USDC stablecoin on Coinbase&apos;s L2. Instant settlement, no
              chargebacks, near-zero gas.
            </p>
            <div className="dual-rail-props">
              <div className="dual-rail-prop">
                <span className="dual-rail-check">&#x2713;</span> USDC &amp;
                USDT (6 decimals)
              </div>
              <div className="dual-rail-prop">
                <span className="dual-rail-check">&#x2713;</span> On-chain
                session key limits
              </div>
              <div className="dual-rail-prop">
                <span className="dual-rail-check">&#x2713;</span> Verified
                smart contract on BaseScan
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* PRICING */}
      <section className="section">
        <div className="section-label">Pricing</div>
        <div className="pricing-block">
          <div className="pricing-left">
            <div className="pricing-big">
              3<span>&cent;</span>
            </div>
            <div className="pricing-forever">
              per successful transaction &mdash; or 3% under $1.
            </div>
            <div className="pricing-context">
              <p className="pricing-context-line">
                Delegare is not a payment processor — it&apos;s the{" "}
                <strong>authorization layer</strong> that makes your existing
                payments agent-ready. Think of it as the identity and
                permissions middleware between your agent and your money.
              </p>
              <p className="pricing-context-line">
                Your Stripe or USDC setup stays exactly as it is. Delegare
                sits in front of it, handling agent identity, spending limits,
                and autonomous payment negotiation.
              </p>
              <p className="pricing-context-line">
                Under $1, the fee drops to 3% — making API micropayments and
                agent-to-agent transactions commercially viable for everyone.
              </p>
              <p className="pricing-context-note">
                For reference: Stripe&apos;s base fee on a $25 transaction is
                ~$1.03. Delegare&apos;s authorization layer costs $0.03. These
                are different things. Both exist on every transaction.
              </p>
            </div>
          </div>
          <div className="pricing-right">
            {[
              {
                icon: "\u221E",
                title: "No volume pricing",
                desc: "100 or 10 million transactions \u2014 the price never changes. No tiers, no thresholds, no upgrade conversations.",
              },
              {
                icon: "0",
                title: "Free for buyers",
                desc: "Connecting a wallet, setting spending limits, revoking mandates \u2014 always free. Only merchants pay the fee.",
              },
              {
                icon: "\u00B5",
                title: "Micropayment-ready",
                desc: "Under $1, the fee is just 3% \u2014 a 50\u00A2 API call costs 1.5\u00A2. Above $1, it\u2019s a flat 3\u00A2 no matter the amount.",
              },
            ].map((f) => (
              <div key={f.title} className="pricing-feature">
                <div className="pricing-feature-icon">{f.icon}</div>
                <div className="pricing-feature-text">
                  <div className="pricing-feature-title">{f.title}</div>
                  <div className="pricing-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* CODE */}
      <section className="section">
        <div className="section-label">Merchant integration</div>
        <div className="code-block">
          <div className="code-header">
            <div className="code-dot" style={{ background: "#ff5f57" }} />
            <div className="code-dot" style={{ background: "#febc2e" }} />
            <div className="code-dot" style={{ background: "#28c840" }} />
            <span className="code-tab">5 minutes to first payment</span>
          </div>
          <div className="code-body">
            <div>
              <span className="c-dim">{"// 1. install"}</span>
            </div>
            <div>
              <span className="c-green">pnpm</span>
              <span className="c-white"> add </span>
              <span className="c-gold">@delegare/sdk</span>
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="c-dim">{"// 2. initialize"}</span>
            </div>
            <div>
              <span className="c-blue">import</span>
              <span className="c-white"> {"{ Delegare }"} </span>
              <span className="c-blue">from</span>
              <span className="c-gold"> &apos;@delegare/sdk&apos;</span>
            </div>
            <div>
              <span className="c-blue">const</span>
              <span className="c-white"> delegare </span>
              <span className="c-dim">=</span>
              <span className="c-white"> new </span>
              <span className="c-green">Delegare</span>
              <span className="c-white">(process.env.</span>
              <span className="c-gold">DELEGARE_API_KEY</span>
              <span className="c-white">)</span>
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="c-dim">
                {
                  "// 3. charge via spending mandate (agent presents this automatically)"
                }
              </span>
            </div>
            <div>
              <span className="c-blue">const</span>
              <span className="c-white"> receipt </span>
              <span className="c-dim">=</span>
              <span className="c-blue"> await</span>
              <span className="c-white"> delegare.</span>
              <span className="c-green">charge</span>
              <span className="c-white">({"{"}</span>
            </div>
            <div>
              <span className="c-white">{"  "}intentMandate,</span>
            </div>
            <div>
              <span className="c-white">{"  "}amountCents: </span>
              <span className="c-gold">4999</span>
              <span className="c-dim">,</span>
              <span className="c-white">{"  "}</span>
              <span className="c-dim">{"// $49.99"}</span>
            </div>
            <div>
              <span className="c-white">{"  "}currency: </span>
              <span className="c-gold">&apos;usd&apos;</span>
              <span className="c-dim">,</span>
            </div>
            <div>
              <span className="c-white">{"  "}description: </span>
              <span className="c-gold">&apos;Pro plan &middot; Jan 2026&apos;</span>
              <span className="c-dim">,</span>
            </div>
            <div>
              <span className="c-white">{"  "}idempotencyKey: </span>
              <span className="c-gold">{"`pro_${userId}_2026_01`"}</span>
              <span className="c-dim">,</span>
            </div>
            <div>
              <span className="c-white">{"})"}</span>
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="c-dim">
                {
                  "// receipt.receiptId \u00B7 receipt.status \u00B7 receipt.railUsed \u00B7 receipt.txHash"
                }
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* BOTTOM CTA */}
      <section className="section">
        <div className="cta-banner">
          <div className="cta-banner-heading">
            Ready to make your payments agent-ready?
          </div>
          <p className="cta-banner-sub">
            Buyers connect for free. Merchants integrate in 5 minutes. From
            3&cent; per transaction.
          </p>
          <div className="cta-banner-actions">
            <a
              href={`${dashboardUrl}/setup?ref=cta`}
              className="btn-primary"
            >
              Get started free
            </a>
            <a
              href={`${dashboardUrl}/onboarding?type=merchant`}
              className="btn-merchant"
            >
              Integrate as a merchant
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="footer">
          <div className="footer-logo">
            delegare<span>.</span>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 300,
                color: "rgba(240,237,232,0.3)",
                marginTop: "8px",
                letterSpacing: "0.02em",
              }}
            >
              Built by{" "}
              <a
                href="https://securelend.ai"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(240,237,232,0.2)",
                }}
              >
                SecureLend
              </a>
            </div>
          </div>
          <div className="footer-links">
            <a href="https://docs.delegare.dev" className="footer-link">
              Docs
            </a>
            <a
              href="https://github.com/delegare/delegare"
              className="footer-link"
            >
              GitHub
            </a>
            <a href={dashboardUrl} className="footer-link">
              Dashboard
            </a>
            <a
              href="https://delegare.dev/legal/privacy"
              className="footer-link"
            >
              Privacy
            </a>
            <a href="https://delegare.dev/legal/terms" className="footer-link">
              Terms
            </a>
          </div>
          <div className="footer-free">
            Connecting your agent is always free.
          </div>
        </div>
      </footer>
    </main>
  );
}
