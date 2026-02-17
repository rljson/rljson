// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

// .............................................................................
/**
 * Server → Client acknowledgment that all (or some) receivers
 * successfully received and processed a given ref.
 *
 * Sent on the `${route}:ack` event after the server has collected
 * individual client ACKs (or after a timeout).
 */
export type AckPayload = {
  /** The ref being acknowledged. */
  r: string;

  /** `true` if all connected clients confirmed receipt; `false` on timeout / partial. */
  ok: boolean;

  /** Number of clients that confirmed receipt. */
  receivedBy?: number;

  /** Total number of receiver clients at the time of broadcast. */
  totalClients?: number;
};

// .............................................................................
/**
 * Returns an example AckPayload where all clients confirmed receipt.
 */
export const ackPayloadExample = (): AckPayload => ({
  r: '1700000000001:EfGh',
  ok: true,
  receivedBy: 3,
  totalClients: 3,
});

// .............................................................................
/**
 * Returns an example AckPayload for a partial / timed-out acknowledgment.
 */
export const ackPayloadPartialExample = (): AckPayload => ({
  r: '1700000000001:EfGh',
  ok: false,
  receivedBy: 1,
  totalClients: 3,
});
