export { requireX402Payment } from './middleware';
export { declareDiscoveryExtension } from './discovery';
export type { DiscoveryExtensionConfig } from './discovery';
export type {
  X402Options,
  X402Requirement,
  X402Challenge,
  X402PaymentReceipt,
  // Credit-bundle fallback (non-crypto payment rail)
  CreditBundleConfig,
  CreditBundleTier,
  CreditBundlePaymentMethod,
  BundleValidationResult,
} from './types';
