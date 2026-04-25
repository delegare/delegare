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
