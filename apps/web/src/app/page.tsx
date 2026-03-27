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
        .hero-price {
          display: flex; align-items: baseline; gap: 8px;
          animation: fadeUp 0.8s 0.2s ease both;
        }
        .hero-price-num {
          font-family: 'DM Serif Display', serif;
          font-size: 52px; color: #f0ede8; letter-spacing: -2px;
        }
        .hero-price-label {
          font-size: 14px; color: rgba(240,237,232,0.45);
          font-weight: 300; line-height: 1.4;
        }
        .hero-price-label strong { color: #f0ede8; font-weight: 500; display: block; }
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
          <a href="https://app.delegare.dev" className="nav-cta">
            Get API key →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            Now in beta
          </div>
          <h1 className="hero-heading">
            Your agent pays.
            <br />
            <em>You stay in control.</em>
          </h1>
          <p className="hero-sub">
            Delegare lets you give your AI agent a spending allowance — without
            handing over your card number, wallet seed, or any credentials. Your
            agent pays for things within limits you set. Always.
          </p>
          <div className="hero-price">
            <div className="hero-price-num">3¢</div>
            <div className="hero-price-label">
              <strong>per transaction. always.</strong>
              10× cheaper than Stripe. No percentage fees. No tiers.
            </div>
          </div>
          <div className="hero-actions">
            <a href="#connect" className="btn-primary">
              Connect your agent →
            </a>
            <a href="https://docs.delegare.dev" className="btn-secondary">
              Merchant docs
            </a>
          </div>
        </div>

        <div className="hero-right">
          {/* USER CARD */}
          <div className="audience-card">
            <span className="audience-tag tag-user">
              For agent users — always free
            </span>
            <div className="audience-title">Give your agent a wallet.</div>
            <p className="audience-body">
              Set a spending limit. Connect your card or USDC wallet once. Your
              agent gets a delegate token — not your credentials. It pays for
              services autonomously, within the limits you set.
            </p>
            <div className="audience-detail">
              Works with Claude, ChatGPT, and any MCP-compatible agent
            </div>
            <a href="#connect" className="audience-link">
              Set up your spending delegate →
            </a>
          </div>

          {/* MERCHANT CARD */}
          <div className="audience-card">
            <span className="audience-tag tag-merchant">For merchants</span>
            <div className="audience-title">Accept payments from agents.</div>
            <p className="audience-body">
              Drop in the SDK. Your service accepts agent-initiated payments on
              any rail — card, USDC, bank transfer. Already on Stripe? You&apos;re
              95% done.
            </p>
            <div className="audience-detail">
              3¢ flat per transaction · no percentage · no volume pricing
            </div>
            <a href="https://docs.delegare.dev" className="audience-link">
              Read the integration docs →
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
              title: "User sets limits",
              body: "Max per transaction. Monthly cap. Allowed merchants. Set once in a browser — takes 60 seconds.",
            },
            {
              n: "02",
              title: "Delegate token issued",
              body: "A scoped token goes into the agent's context. Not your card. Not your private key. Just an authorization.",
            },
            {
              n: "03",
              title: "Agent pays autonomously",
              body: "Agent calls pay(). Delegare validates limits, routes to the right rail, executes atomically.",
            },
            {
              n: "04",
              title: "Receipt delivered",
              body: "Immutable receipt logged. 3¢ charged to the merchant. User notified passively. Done.",
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

      {/* RAILS */}
      <section className="section">
        <div className="section-label">Two rails. One interface.</div>
        <div className="rails-grid">
          <div className="rail-card">
            <div className="rail-icon rail-icon-fiat">💳</div>
            <div className="rail-name">Fiat</div>
            <p className="rail-desc">
              Stripe Connect handles card and bank payments. Already on Stripe?
              Your existing integration works — Delegare sits in front of it as
              the authorization layer.
            </p>
            <div className="rail-props">
              {[
                "Cards, bank accounts, Apple Pay, Google Pay",
                "Stripe Link users pay with one click",
                "Funds land in your existing Stripe balance",
                "Your webhooks and reconciliation unchanged",
              ].map((p) => (
                <div key={p} className="rail-prop">
                  <span className="rail-prop-check">✦</span> {p}
                </div>
              ))}
            </div>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-crypto">🔵</div>
            <div className="rail-name">Crypto</div>
            <p className="rail-desc">
              USDC and USDT on Base L2. ERC-4337 session keys mean the agent
              signs transactions without ever holding the user&apos;s master private
              key.
            </p>
            <div className="rail-props">
              {[
                "USDC · USDT on Base mainnet",
                "~2 second settlement, gas under $0.001",
                "Session key scoped to Delegare contract only",
                "Master key never leaves user&apos;s wallet",
              ].map((p) => (
                <div key={p} className="rail-prop">
                  <span className="rail-prop-check">✦</span> {p}
                </div>
              ))}
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
              3<span>¢</span>
            </div>
            <div className="pricing-forever">
              per successful transaction. flat. forever.
            </div>
            <div className="pricing-context">
              <p className="pricing-context-line">
                Delegare is not a payment processor — it&apos;s the authorization
                layer that makes your existing payments agent-ready.
              </p>
              <p className="pricing-context-line">
                Your Stripe setup stays exactly as it is. Delegare sits in front
                of it, handling agent identity, spending limits, and autonomous
                authorization.
              </p>
              <p className="pricing-context-note">
                For reference: Stripe&apos;s base fee on a $25 transaction is ~$1.03.
                Delegare&apos;s authorization layer costs $0.03. These are different
                things. Both exist on every transaction.
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
              <span className="c-white"> d </span>
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
                {"// 3. charge — delegateToken comes from the agent's context"}
              </span>
            </div>
            <div>
              <span className="c-blue">const</span>
              <span className="c-white"> receipt </span>
              <span className="c-dim">=</span>
              <span className="c-blue"> await</span>
              <span className="c-white"> d.</span>
              <span className="c-green">charge</span>
              <span className="c-white">({"{"}</span>
            </div>
            <div>
              <span className="c-white">{"  "}delegateToken,</span>
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
              <span className="c-dim">{"// receipt.receiptId · receipt.railUsed · receipt.txHash"}</span>
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
            <a href="https://app.delegare.dev" className="footer-link">
              Dashboard
            </a>
            <a
              href="https://delegare.dev/legal/privacy"
              className="footer-link"
            >
              Privacy
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
