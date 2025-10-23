// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Route } from '../../src/route/route.ts';

describe('Route', () => {
  it('returns segments of a route', () => {
    const route = Route.fromFlat('/a/b/c');
    expect(route.segments).toEqual([
      {
        tableKey: 'a',
      },
      {
        tableKey: 'b',
      },
      {
        tableKey: 'c',
      },
    ]);
    expect(route.flat).toBe('/a/b/c');
  });

  it('returns segment Ref types', async () => {
    const route = Route.fromFlat('/a@hashA/b@timeId:123/c');

    expect(Route.segmentRef(route.segments[0]!)).toBe('hashA');
    expect(Route.segmentHasRef(route.segments[0]!)).toBe(true);
    expect(Route.segmentHasDefaultRef(route.segments[0]!)).toBe(true);
    expect(Route.segmentHasHistoryRef(route.segments[0]!)).toBe(false);

    expect(Route.segmentRef(route.segments[1]!)).toBe('timeId:123');
    expect(Route.segmentHasRef(route.segments[1]!)).toBe(true);
    expect(Route.segmentHasDefaultRef(route.segments[1]!)).toBe(false);
    expect(Route.segmentHasHistoryRef(route.segments[1]!)).toBe(true);

    expect(Route.segmentRef(route.segments[2]!)).toBeUndefined();
    expect(Route.segmentHasRef(route.segments[2]!)).toBe(false);
    expect(Route.segmentHasDefaultRef(route.segments[2]!)).toBe(false);
    expect(Route.segmentHasHistoryRef(route.segments[2]!)).toBe(false);
  });

  it('returns segments of a route w/ hash ref', async () => {
    const route = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
    expect(route.segments).toEqual([
      {
        tableKey: 'a',
        aRef: 'hashA',
      },
      {
        tableKey: 'b',
        bRef: 'hashB',
      },
      {
        tableKey: 'c',
        cRef: 'hashC',
      },
    ]);
    expect(route.flat).toBe('/a@hashA/b@hashB/c@hashC');
  });

  it('returns segments of a route w/ timeId ref', async () => {
    const route = Route.fromFlat('/a@timeId:123/b@timeId:456/c@timeId:789');
    expect(route.segments).toEqual([
      {
        tableKey: 'a',
        aHistoryRef: 'timeId:123',
      },
      {
        tableKey: 'b',
        bHistoryRef: 'timeId:456',
      },
      {
        tableKey: 'c',
        cHistoryRef: 'timeId:789',
      },
    ]);
    expect(route.flat).toBe('/a@timeId:123/b@timeId:456/c@timeId:789');
  });

  it('returns isValid of a route', () => {
    const route = Route.fromFlat('/a/b/c');
    expect(route.isValid).toBe(true);
    const invalidRoute = Route.fromFlat('///');
    expect(invalidRoute.isValid).toBe(false);
  });
  it('returns any segment of a route', () => {
    const route = Route.fromFlat('/a/b/c');

    expect(route.segment(0)).toEqual({ tableKey: 'a' });
    expect(route.segment()).toEqual({ tableKey: 'c' });
  });
  it('returns root segment of a route', () => {
    const route = Route.fromFlat('/parent/root');

    expect(route.root).toEqual({ tableKey: 'root' });
  });
  it('returns top segment of a route', () => {
    const route = Route.fromFlat('/parent/root');

    expect(route.top).toEqual({ tableKey: 'parent' });
  });
  it('returns deeper segments of a route', () => {
    const routeTopLevel = Route.fromFlat('/a/b/c');
    const routeMiddleLevel = routeTopLevel.deeper();
    const routeRootLevel = routeTopLevel.deeper(2);

    expect(() => routeTopLevel.deeper(0)).toThrowError(
      'Steps must be greater than 0',
    );
    expect(() => routeTopLevel.deeper(3)).toThrowError(
      'Cannot go deeper than the root',
    );

    expect(routeTopLevel.flat).toBe('/a/b/c');
    expect(routeMiddleLevel.flat).toBe('/b/c');
    expect(routeRootLevel.flat).toBe('/c');
    expect(routeRootLevel.isRoot).toBe(true);
  });

  it('returns last segment of a route', () => {
    const route = Route.fromFlat('/a/b/c');

    expect(route.isRoot).toBe(false);
  });
});
