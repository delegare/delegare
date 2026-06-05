"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

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
      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          delegare<span>.</span>
        </Link>
        <div className="nav-links">
          <a href="https://market.delegare.dev" className="nav-link">
            Market
          </a>
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
            Merchants get paid. Max 3&cent; per transaction.
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
              Stripe or USDC on Base. Your endpoint is automatically listed on{" "}
              <a href="https://market.delegare.dev" style={{ color: "#c8b99a", textDecoration: "underline" }}>
                Delegare Market
              </a>{" "}
              so agents can discover and pay you without any manual setup.
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

      {/* DEMO VIDEO */}
      <section className="video-section">
        <div className="video-frame">
          <LiteYouTubeEmbed
            id="9ZAfqtAeco4"
            title="Delegare demo"
            noCookie={true}
            adNetwork={true}
            params="rel=0&modestbranding=1"
          />
        </div>
        <div className="video-caption">Watch: Delegare in 90 seconds</div>
      </section>

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

      {/* DISCOVERY */}
      <section className="section">
        <div className="section-label">Agent discovery</div>
        <p
          style={{
            textAlign: "center",
            color: "rgba(240,237,232,0.6)",
            maxWidth: 580,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Install <code style={{ color: "#c8b99a", fontSize: "0.9em" }}>@delegare/x402</code> and your endpoint is automatically listed everywhere agents look — no registration, no extra config.
        </p>
        <div className="rails-grid">
          <div className="rail-card">
            <div className="rail-icon rail-icon-crypto">
              <span role="img" aria-label="store">&#x1F3EA;</span>
            </div>
            <div className="rail-name">
              <a href="https://market.delegare.dev" style={{ color: "inherit", textDecoration: "none", borderBottom: "1px solid rgba(200,185,154,0.4)" }}>
                Delegare Market
              </a>
            </div>
            <p className="rail-desc">
              Our unified API marketplace aggregates endpoints from both the x402 (CDP Bazaar) and MPP ecosystems in one place. Agents using the Delegare SDK discover and pay in a single query.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-fiat">
              <span role="img" aria-label="globe">&#x1F310;</span>
            </div>
            <div className="rail-name">agentic.market + MPPScan</div>
            <p className="rail-desc">
              The middleware simultaneously emits x402 v2 and MPP headers on every 402 response. Your endpoint appears on Coinbase&apos;s agentic.market and MPPScan automatically — no separate registrations.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-crypto">
              <span role="img" aria-label="robot">&#x1F916;</span>
            </div>
            <div className="rail-name">Searchable by Claude &amp; ChatGPT</div>
            <p className="rail-desc">
              Agents running on Claude, ChatGPT, or any MCP-compatible client can discover your endpoint via tool use — input schema, output schema, and pricing all surfaced automatically from your middleware config.
            </p>
          </div>
          <div className="rail-card">
            <div className="rail-icon rail-icon-fiat">
              <span role="img" aria-label="arrows">&#x21C4;</span>
            </div>
            <div className="rail-name">Built-in On &amp; Off Ramp</div>
            <p className="rail-desc">
              Agents and users can move between fiat and USDC without leaving the flow. Card-to-crypto and crypto-to-card conversion is built in — so a buyer with dollars can pay a merchant expecting USDC, and vice versa.
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
              3<span>&cent;</span>
            </div>
            <div className="pricing-forever">
              per successful transaction &mdash; or 3% under $1. Minimum 0.5&cent; includes gas on Base.
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
                desc: "Under $1, the fee is 3% with a 0.5\u00A2 minimum \u2014 a 50\u00A2 API call costs 1.5\u00A2. Above $1, it\u2019s a flat 3\u00A2. The minimum covers gas on Base so neither party pays separately.",
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
            Buyers connect for free. Merchants integrate in 5 minutes. Max
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
            <Link href="/blog" className="footer-link">
              Blog
            </Link>
            <Link href="/learn" className="footer-link">
              Learn
            </Link>
            <a href="https://market.delegare.dev" className="footer-link">
              Market
            </a>
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
