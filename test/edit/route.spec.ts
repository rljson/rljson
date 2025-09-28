// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Route } from '../../src/edit/route.ts';

describe('Route', () => {
  it('Returns any segment of a route', async () => {
    const route = Route.fromFlat('/a/b/c');

    await expect(route.segment(0)).toBe('a');
    await expect(route.segment()).toBe('c');
  });
  it('Returns deeper segments of a route', async () => {
    const routeTopLevel = Route.fromFlat('/a/b/c');
    const routeMiddleLevel = routeTopLevel.deeper();
    const routeRootLevel = routeTopLevel.deeper(2);

    await expect(() => routeTopLevel.deeper(0)).toThrowError(
      'Steps must be greater than 0',
    );
    await expect(() => routeTopLevel.deeper(3)).toThrowError(
      'Cannot go deeper than the root',
    );

    await expect(routeTopLevel.flat).toBe('/a/b/c');
    await expect(routeMiddleLevel.flat).toBe('/b/c');
    await expect(routeRootLevel.flat).toBe('/c');
    await expect(routeRootLevel.isRoot).toBe(true);
  });

  it('Returns last segment of a route', async () => {
    const route = Route.fromFlat('/a/b/c');

    await expect(route.isRoot).toBe(false);
  });
});
