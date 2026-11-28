// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { InsertHistoryTimeId } from '../insertHistory/insertHistory.ts';

// .............................................................................
/**
 * Which node holds which state of a route: per node id, the newest ref the
 * node holds completely — every row under it in its own store.
 *
 * A hub keeps one per route and sends it with what it sends its clients, so a
 * reader knows which nodes it can read a ref's data from besides the hub. A
 * node enters it as the sender of a ref, or by saying it holds one
 * ({@link HeldPayload}), and leaves it when its last connection to the hub
 * ends.
 *
 * A hint, not a promise: a node may have moved on, may be gone, or may lack a
 * blob the rows name. The hub can still serve the data.
 */
export type RouteHolders = Record<string, InsertHistoryTimeId>;

// .............................................................................
/**
 * Client → Server: the client's node holds a ref of the route completely.
 *
 * Sent on `${route}:held` ({@link SyncEventNames.held}). It carries no node
 * id: the hub knows which node a connection belongs to.
 */
export type HeldPayload = {
  /** The ref the node holds every row under. */
  r: InsertHistoryTimeId;
};

// .............................................................................
/**
 * Returns an example of the holders of a route.
 * @returns Two nodes on the newer ref, one on an older one.
 */
export const routeHoldersExample = (): RouteHolders => ({
  node_ExAmPlE: '1700000000001:EfGh',
  node_OtHeR: '1700000000001:EfGh',
  node_BeHiNd: '1700000000000:XyZw',
});

// .............................................................................
/**
 * Returns an example held payload.
 * @returns The payload.
 */
export const heldPayloadExample = (): HeldPayload => ({
  r: '1700000000001:EfGh',
});
