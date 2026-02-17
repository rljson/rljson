// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

// .............................................................................
/**
 * The set of socket event names used by the sync protocol for a given route.
 * Using this helper avoids hard-coding event name strings across layers
 * and prevents typos.
 * @example
 * ```ts
 * const events = syncEvents('/sharedTree');
 * socket.on(events.ref, handleRef);
 * socket.on(events.ack, handleAck);
 * socket.emit(events.gapFillReq, request);
 * ```
 */
export type SyncEventNames = {
  /** Bidirectional: ref broadcast (existing event). */
  ref: string;
  /** Server → Client: delivery acknowledgment. */
  ack: string;
  /** Client → Server: individual client ACK of a received ref. */
  ackClient: string;
  /** Client → Server: request missing refs. */
  gapFillReq: string;
  /** Server → Client: supply missing refs. */
  gapFillRes: string;
  /** Server → Client: bootstrap latest ref on connect / heartbeat. */
  bootstrap: string;
};

// .............................................................................
/**
 * Creates typed, route-specific socket event names for the sync protocol.
 * @param route - The route string (e.g. `"/sharedTree"`)
 * @returns An object with all sync event names derived from the route
 */
export const syncEvents = (route: string): SyncEventNames => ({
  ref: route,
  ack: `${route}:ack`,
  ackClient: `${route}:ack:client`,
  gapFillReq: `${route}:gapfill:req`,
  gapFillRes: `${route}:gapfill:res`,
  bootstrap: `${route}:bootstrap`,
});
