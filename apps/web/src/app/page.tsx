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
          font-weight: 300; max-width: 420px;
          animation: fadeUp 0.8s 0.1s ease both;
        }
        .hero-demo {
          width: 100%; aspect-ratio: 16/9; background: rgba(240,237,232,0.03);
          border: 1px dashed rgba(240,237,232,0.2); border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(240,237,232,0.4); font-size: 14px; font-style: italic;
          animation: fadeUp 0.8s 0.2s ease both; margin-bottom: 24px;
        }
        .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: fadeUp 0.8s 0.3s ease both;
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
        .audience-detail {
          font-size: 13px; color: rgba(240,237,232,0.35);
          display: flex; align-items: center; gap: 8px;
        }
        .audience-detail::before {
          content: ''; width: 16px; height: 1px;
          background: rgba(240,237,232,0.2); flex-shrink: 0;
        }
        .audience-link {
          font-size: 13px; font-weight: 500;
          color: rgba(240,237,232,0.55); text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 14px; transition: color 0.2s;
        }
        .audience-link:hover { color: #f0ede8; }

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
        .flow-rail {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; margin-top: 12px;
          color: rgba(240,237,232,0.25);
        }

        /* RAILS */
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
          margin-bottom: 24px;
        }
        .rail-props { display: flex; flex-direction: column; gap: 10px; }
        .rail-prop {
          display: flex; align-items: center; gap: 12px;
          font-size: 13px; color: rgba(240,237,232,0.5);
        }
        .rail-prop-check { color: #c8b99a; font-size: 11px; }

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
        .pricing-comparison {
          display: flex; flex-direction: column; gap: 12px;
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
          .pricing-block { grid-template-columns: 1fr; gap: 40px; padding: 40px 28px; }
          .pricing-big { font-size: 72px; }
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
          <a href={process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://app.delegare.dev'} className="nav-cta">
            Sign in
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            A payment authorization layer
          </div>
          <h1 className="hero-heading">
            Let AI agents pay for things—<em>safely.</em>
          </h1>
          <p className="hero-sub">
            From ordering pizza to paying for APIs, give agents real spending power with user-defined constraints and approvals.
          </p>
          <div className="hero-demo">
            Drop 60-90s Demo Video / GIF here
          </div>
          <div className="hero-actions">
            <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://app.delegare.dev'}/setup?ref=hero`} className="btn-primary">
              Connect your wallet
            </a>
            <a href="https://docs.delegare.dev" className="btn-secondary">
              Read the docs
            </a>
          </div>
        </div>

        <div className="hero-right">
          {/* AHA MOMENT */}
          <div className="audience-card">
            <span className="audience-tag tag-user">
              The "Aha" Moment
            </span>
            <div className="audience-title">Your agent orders dinner.</div>
            <p className="audience-body">
              You approve a $30 food budget. Your agent finds a restaurant, places the order, and pays automatically. It's the future of agentic commerce.
            </p>
            <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://app.delegare.dev'}/setup?ref=card`} className="audience-link">
              Set up your spending delegate →
            </a>
          </div>

          {/* CORE BUSINESS CASE */}
          <div className="audience-card">
            <span className="audience-tag tag-merchant">The Core Business</span>
            <div className="audience-title">Autonomous API payments.</div>
            <p className="audience-body">
              Agents increasingly interact with paid services. Delegare lets them seamlessly handle 402 Payment Required challenges and retry automatically via our SDK or MCP tools.
            </p>
            <a href="https://docs.delegare.dev" className="audience-link">
              Read the x402 integration docs →
            </a>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-label">How it works</div>
        <div className="flow-grid">
          {[
            {
              n: "01",
              title: "Setup session",
              body: "Merchant requests a payment session. Integrates easily into your existing backend or via x402 middleware.",
            },
            {
              n: "02",
              title: "User approves mandate",
              body: "User sets rules: max per transaction, monthly cap, allowed merchants. Set once in a browser.",
            },
            {
              n: "03",
              title: "Agent executes payment",
              body: "The agent uses the mandate to pay autonomously. Delegare validates limits and executes atomically.",
            },
            {
              n: "04",
              title: "Merchant receives funds",
              body: "Settlement via Stripe (Fiat) or Base (Crypto). Immutable receipt delivered. Done.",
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
        <div className="section-label">Built for Trust</div>
        <p style={{ textAlign: 'center', color: 'rgba(240,237,232,0.6)', maxWidth: 650, margin: '0 auto 40px', lineHeight: 1.6 }}>
          People are rightfully skeptical around money. Delegare is built on strict boundaries and cryptographic guarantees to ensure your agent never goes rogue.
        </p>
        <div className="rails-grid">
          <div className="rail-card">
            <div className="rail-icon rail-icon-crypto">🛡️</div>
            <div className="rail-name">Spend Limits</div>
            <p className="rail-desc">
              Atomic server-side counters prevent overspending. If the user-defined limit is $10, it cannot spend $10.01. Race conditions are mathematically prevented.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-fiat">🔒</div>
            <div className="rail-name">No Credential Exposure</div>
            <p className="rail-desc">
              Agents hold a signed <em>Intent Mandate</em> (SD-JWT-VC). Your credit card number, private keys, and seed phrases are never exposed to the agent or the LLM.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-fiat">✅</div>
            <div className="rail-name">Merchant Allowlists</div>
            <p className="rail-desc">
              Mandates are strictly locked to explicitly approved merchants. A mandate authorized for an API provider cannot be used at a pizza shop.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-crypto">⏳</div>
            <div className="rail-name">Expiration Controls</div>
            <p className="rail-desc">
              Mandates have a strict time-to-live (TTL) and expire automatically. Users can also instantly revoke an active mandate from their dashboard at any time.
            </p>
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
              3<span>¢</span>
            </div>
            <div className="pricing-forever">
              per successful transaction. flat. forever.
            </div>
            <div className="pricing-context">
              <p className="pricing-context-line">
                Delegare is not a payment processor — it&apos;s the
                <strong> AP2 authorization layer</strong> and <strong>x402 facilitator</strong> that makes your existing payments agent-ready.
              </p>
              <p className="pricing-context-line">
                Your Stripe or USDC setup stays exactly as it is. Delegare sits in front
                of it, handling agent identity, spending limits, and autonomous
                "set-and-forget" x402 negotiations.
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
                icon: "∞",
                title: "No volume pricing",
                desc: "100 or 10 million transactions — the price never changes. No tiers, no thresholds, no upgrade conversations.",
              },
              {
                icon: "0",
                title: "Free for users",
                desc: "Connecting a card or crypto wallet, setting spending limits, revoking delegates — always free. You only pay as a merchant.",
              },
              {
                icon: "⊕",
                title: "No percentage fees",
                desc: "A $10 transaction and a $10,000 transaction both cost 3¢. The rails are free. You keep your margin.",
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
        <div className="section-label">Integration</div>
        <div className="code-block">
          <div className="code-header">
            <div className="code-dot" style={{ background: "#ff5f57" }} />
            <div className="code-dot" style={{ background: "#febc2e" }} />
            <div className="code-dot" style={{ background: "#28c840" }} />
            <span className="code-tab">merchant integration · ~5 minutes</span>
          </div>
          <div className="code-body">
            <div>
              <span className="c-dim">{"// 1. install"}</span>
            </div>
            <div>
              <span className="c-green">npm</span>
              <span className="c-white"> install </span>
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
                {"// 3. fetch any paywalled resource (x402 handled automatically)"}
              </span>
            </div>
            <div>
              <span className="c-blue">const</span>
              <span className="c-white"> res </span>
              <span className="c-dim">=</span>
              <span className="c-blue"> await</span>
              <span className="c-white"> delegare.</span>
              <span className="c-green">fetch</span>
              <span className="c-white">(</span>
              <span className="c-gold">&apos;https://api.merchant.com/premium&apos;</span>
              <span className="c-white">, {"{"}{"}"}, intentMandate)</span>
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="c-dim">
                {"// 4. or charge explicitly via AP2 intent mandate"}
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
              <span className="c-gold">&apos;Pro plan · Jan 2026&apos;</span>
              <span className="c-dim">,</span>
            </div>
            <div>
              <span className="c-white">{"  "}idempotencyKey: </span>
              <span className="c-gold">`pro_{"${userId}"}_2026_01`</span>
              <span className="c-dim">,</span>
            </div>
            <div>
              <span className="c-white">{"})"}</span>
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="c-dim">
                {"// receipt.receiptId · receipt.railUsed · receipt.txHash"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* FOOTER */}
      <footer style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="footer">
          <div className="footer-logo">
            delegare<span>.</span>
            <div style={{ fontSize: '11px', fontWeight: 300, color: 'rgba(240,237,232,0.3)', marginTop: '8px', letterSpacing: '0.02em' }}>
              Built by <a href="https://securelend.com" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid rgba(240,237,232,0.2)' }}>SecureLend</a>
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
            <a href={process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.delegare.dev"} className="footer-link">
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
