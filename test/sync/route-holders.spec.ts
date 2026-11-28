// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  HeldPayload,
  heldPayloadExample,
  RouteHolders,
  routeHoldersExample,
} from '../../src/sync/route-holders.ts';

describe('RouteHolders', () => {
  it('maps each node to the newest ref it holds', () => {
    const holders = routeHoldersExample();
    expect(holders).toEqual({
      node_ExAmPlE: '1700000000001:EfGh',
      node_OtHeR: '1700000000001:EfGh',
      node_BeHiNd: '1700000000000:XyZw',
    });
  });

  it('may be empty: no node is known to hold anything', () => {
    const holders: RouteHolders = {};
    expect(Object.keys(holders)).toEqual([]);
  });
});

describe('HeldPayload', () => {
  it('names the ref, not the node', () => {
    const payload: HeldPayload = heldPayloadExample();
    expect(payload).toEqual({ r: '1700000000001:EfGh' });
  });
});
