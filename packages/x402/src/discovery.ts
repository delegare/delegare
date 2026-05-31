import type { Request, Response, NextFunction } from 'express';

export interface DiscoveryExtensionConfig {
  input?: any;
  inputSchema?: any;
  bodyType?: 'json' | 'form';
  output?: {
    example?: any;
    schema?: any;
  };
  description?: string;

  // ── CDP Bazaar discovery display fields (added 2026-05) ─────────────────
  // CDP's /discovery/resources schema surfaces these on agentic.market.
  // Provider-supplied; CDP moderates and re-hosts iconUrl. Optional but
  // strongly recommended — without them the marketplace listing is bland
  // and uncategorised.
  /** Brand name grouping multiple routes under one service on agentic.market. */
  serviceName?: string;
  /** Low-cardinality filter labels — short, lowercase, hyphenated. */
  tags?: string[];
  /** Square icon URL. CDP moderates and re-hosts. */
  iconUrl?: string;
}

/**
 * Middleware to attach CDP Bazaar discovery metadata to a route.
 * When the `requireX402Payment` middleware processes a payment, it will
 * include this metadata in the `extensions.bazaar` payload sent to the
 * Facilitator for indexing.
 */
export function declareDiscoveryExtension(config: DiscoveryExtensionConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    (req as any)._x402BazaarExtension = config;
    next();
  };
}
