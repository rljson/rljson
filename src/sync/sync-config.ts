// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

// .............................................................................
/**
 * Feature flags for hardened sync behavior.
 *
 * All flags default to `false` / `undefined`, so existing code that
 * does not set a `SyncConfig` continues to work exactly as before.
 *
 * | Flag                    | Concept              | Effect when enabled                    |
 * |-------------------------|----------------------|----------------------------------------|
 * | `causalOrdering`        | Predecessor chain    | Attach `seq` + `p` to payloads;        |
 * |                         |                      | detect gaps; request gap-fill          |
 * | `requireAck`            | Acknowledgment       | Wait for server ACK after send         |
 * | `ackTimeoutMs`          | Acknowledgment       | Timeout before treating ACK as failed  |
 * | `includeClientIdentity` | Client identity      | Attach `c` + `t` to payloads           |
 * | `maxDedupSetSize`       | Memory management    | Cap dedup sets; default 10 000         |
 */
export type SyncConfig = {
  /**
   * When `true`, the Connector attaches a monotonic `seq` number and
   * causal predecessor timeIds (`p`) to every outgoing payload. Receiving
   * Connectors detect sequence gaps and request gap-fill from the server.
   */
  causalOrdering?: boolean;

  /**
   * When `true`, the Connector awaits a server-side `AckPayload` after
   * sending a ref. The `sendWithAck()` method becomes available.
   */
  requireAck?: boolean;

  /**
   * Timeout in milliseconds for awaiting an ACK from the server.
   * Only meaningful when `requireAck` is `true`.
   * Defaults to `10_000` (10 seconds) when not specified.
   */
  ackTimeoutMs?: number;

  /**
   * When `true`, the Connector attaches the stable `ClientId` (`c`) and
   * a wall-clock timestamp (`t`) to every outgoing payload.
   */
  includeClientIdentity?: boolean;

  /**
   * Maximum number of entries per dedup set generation before rotation.
   * The Connector uses two-generation eviction: when the current generation
   * exceeds this limit, it becomes the previous generation and a new empty
   * set is created. Lookups check both generations.
   * Defaults to `10_000` when not specified.
   */
  maxDedupSetSize?: number;

  /**
   * Interval in milliseconds for the server to broadcast its latest ref
   * to all connected clients as a heartbeat. This acts as a fallback
   * in case the initial bootstrap message on connect was missed.
   *
   * When `undefined` or `0`, no periodic heartbeat is sent — only the
   * immediate bootstrap on `addSocket()` is active.
   *
   * Recommended value: `30_000` (30 seconds) or higher.
   */
  bootstrapHeartbeatMs?: number;
};

// .............................................................................
/**
 * Default SyncConfig — all features disabled (backward-compatible mode).
 */
export const syncConfigDefault = (): SyncConfig => ({});

// .............................................................................
/**
 * Returns an example SyncConfig with all features enabled.
 */
export const syncConfigFullExample = (): SyncConfig => ({
  causalOrdering: true,
  requireAck: true,
  ackTimeoutMs: 5_000,
  includeClientIdentity: true,
  maxDedupSetSize: 10_000,
});

// .............................................................................
/**
 * Returns an example SyncConfig with only causal ordering enabled.
 */
export const syncConfigCausalOnlyExample = (): SyncConfig => ({
  causalOrdering: true,
});
