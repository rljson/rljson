// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { InsertHistoryTimeId } from '../insertHistory/insertHistory.ts';

import { ClientId } from './client-id.ts';

// .............................................................................
/**
 * Wire-protocol payload transmitted between Connector and Server.
 *
 * The two required fields (`o`, `r`) provide backward-compatible
 * self-echo filtering and ref identification. All other fields are
 * optional and activate only when the corresponding `SyncConfig`
 * flags are set.
 *
 * | Field   | Concept                | Purpose                                |
 * |---------|------------------------|----------------------------------------|
 * | `r`     | existing               | The ref being announced                |
 * | `o`     | existing               | Ephemeral origin for self-echo filter  |
 * | `c`     | Client identity        | Stable client id across reconnections  |
 * | `t`     | Client identity        | Client-side wall-clock timestamp (ms)  |
 * | `seq`   | Predecessor chain      | Monotonic counter per (client, route)  |
 * | `p`     | Predecessor chain      | Causal predecessor timeIds             |
 * | `cksum` | Acknowledgment         | Content checksum for ACK verification  |
 */
export type ConnectorPayload = {
  /** The ref (InsertHistoryTimeId) being announced. */
  r: string;

  /** Ephemeral origin of the sending Connector (for self-echo filtering). */
  o: string;

  /** Stable client identity (survives reconnections). */
  c?: ClientId;

  /** Client-side wall-clock timestamp in milliseconds since epoch. */
  t?: number;

  /** Monotonic sequence number per (client, route) pair. */
  seq?: number;

  /** Causal predecessor InsertHistory timeIds. */
  p?: InsertHistoryTimeId[];

  /** Content checksum of the referenced data, for ACK verification. */
  cksum?: string;
};

// .............................................................................
/**
 * Returns a minimal example ConnectorPayload (backward-compatible format).
 */
export const connectorPayloadExample = (): ConnectorPayload => ({
  o: '1700000000000:AbCd',
  r: '1700000000001:EfGh',
});

// .............................................................................
/**
 * Returns a fully-populated example ConnectorPayload with all optional fields.
 */
export const connectorPayloadFullExample = (): ConnectorPayload => ({
  o: '1700000000000:AbCd',
  r: '1700000000001:EfGh',
  c: 'client_ExAmPlE12345',
  t: 1700000000001,
  seq: 42,
  p: ['1700000000000:XyZw'],
  cksum: 'sha256:abc123def456',
});
