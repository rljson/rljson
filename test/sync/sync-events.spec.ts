// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { syncEvents } from '../../src/sync/sync-events.ts';

describe('syncEvents', () => {
  it('generates all event names from a route', () => {
    const events = syncEvents('/sharedTree');
    expect(events.ref).toBe('/sharedTree');
    expect(events.ack).toBe('/sharedTree:ack');
    expect(events.ackClient).toBe('/sharedTree:ack:client');
    expect(events.gapFillReq).toBe('/sharedTree:gapfill:req');
    expect(events.gapFillRes).toBe('/sharedTree:gapfill:res');
  });

  it('works with nested routes', () => {
    const events = syncEvents('/project/files/tree');
    expect(events.ref).toBe('/project/files/tree');
    expect(events.ack).toBe('/project/files/tree:ack');
    expect(events.ackClient).toBe('/project/files/tree:ack:client');
    expect(events.gapFillReq).toBe('/project/files/tree:gapfill:req');
    expect(events.gapFillRes).toBe('/project/files/tree:gapfill:res');
  });

  it('works with simple single-segment routes', () => {
    const events = syncEvents('/myTree');
    expect(events.ref).toBe('/myTree');
    expect(events.ack).toBe('/myTree:ack');
  });

  it('produces unique event names per route', () => {
    const eventsA = syncEvents('/routeA');
    const eventsB = syncEvents('/routeB');
    expect(eventsA.ack).not.toBe(eventsB.ack);
    expect(eventsA.gapFillReq).not.toBe(eventsB.gapFillReq);
  });

  it('returns distinct values for all five events', () => {
    const events = syncEvents('/tree');
    const values = Object.values(events);
    const unique = new Set(values);
    expect(unique.size).toBe(5);
  });
});
