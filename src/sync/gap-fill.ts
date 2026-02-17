// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { InsertHistoryTimeId } from '../insertHistory/insertHistory.ts';

import { ConnectorPayload } from './connector-payload.ts';

// .............................................................................
/**
 * Client → Server request for missing refs on a specific route.
 *
 * Sent on the `${route}:gapfill:req` event when a Connector detects
 * a gap in the sequence numbers it has received from a peer.
 */
export type GapFillRequest = {
  /** The route for which refs are missing. */
  route: string;

  /** The last sequence number the client has successfully processed. */
  afterSeq: number;

  /**
   * Alternative / additional anchor: the last known InsertHistory timeId.
   * The server may use this to determine the starting point if sequence
   * numbers are unavailable.
   */
  afterTimeId?: InsertHistoryTimeId;
};

// .............................................................................
/**
 * Server → Client response containing the missing refs.
 *
 * Sent on the `${route}:gapfill:res` event in response to a
 * `GapFillRequest`. The `refs` array is ordered chronologically
 * (oldest first).
 */
export type GapFillResponse = {
  /** The route this response corresponds to. */
  route: string;

  /** Ordered list of missing payloads (oldest first). */
  refs: ConnectorPayload[];
};

// .............................................................................
/**
 * Returns an example GapFillRequest.
 */
export const gapFillRequestExample = (): GapFillRequest => ({
  route: '/sharedTree',
  afterSeq: 5,
  afterTimeId: '1700000000000:AbCd',
});

// .............................................................................
/**
 * Returns an example GapFillResponse with two missing refs.
 */
export const gapFillResponseExample = (): GapFillResponse => ({
  route: '/sharedTree',
  refs: [
    { o: '1700000000000:AbCd', r: '1700000000006:MnOp', seq: 6 },
    { o: '1700000000000:AbCd', r: '1700000000007:QrSt', seq: 7 },
  ],
});
