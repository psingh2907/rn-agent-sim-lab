// React Native implements requestIdleCallback at runtime (it replaces the
// InteractionManager removed in 0.87), but its global types don't declare
// it as of 0.87.1. Mirrors the DOM signature.
type IdleDeadline = { readonly didTimeout: boolean; timeRemaining(): number };

declare function requestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout?: number },
): number;
declare function cancelIdleCallback(handle: number): void;
