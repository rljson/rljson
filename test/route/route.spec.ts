// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Route } from '../../src/route/route.ts';

describe('Route', () => {
  describe('segment Ref types', () => {
    it('returns segment Ref types', async () => {
      const route = Route.fromFlat('/a@hashA/b@timeId:123/c');

      expect(Route.segmentRef(route.segments[0]!)).toBe('hashA');
      expect(Route.segmentHasRef(route.segments[0]!)).toBe(true);
      expect(Route.segmentHasDefaultRef(route.segments[0]!)).toBe(true);
      expect(Route.segmentHasInsertHistoryRef(route.segments[0]!)).toBe(false);

      expect(Route.segmentRef(route.segments[1]!)).toBe('timeId:123');
      expect(Route.segmentHasRef(route.segments[1]!)).toBe(true);
      expect(Route.segmentHasDefaultRef(route.segments[1]!)).toBe(false);
      expect(Route.segmentHasInsertHistoryRef(route.segments[1]!)).toBe(true);

      expect(Route.segmentRef(route.segments[2]!)).toBeUndefined();
      expect(Route.segmentHasRef(route.segments[2]!)).toBe(false);
      expect(Route.segmentHasDefaultRef(route.segments[2]!)).toBe(false);
      expect(Route.segmentHasInsertHistoryRef(route.segments[2]!)).toBe(false);
    });
    it('returns correct segment Refs although sliceIds given', async () => {
      const route = Route.fromFlat(
        '/a(slice0,slice1)@hashA/b(slice0,slice1)@timeId:123/c',
      );
      expect(Route.segmentRef(route.segments[0]!)).toBe('hashA');
      expect(Route.segmentRef(route.segments[1]!)).toBe('timeId:123');
      expect(Route.segmentRef(route.segments[2]!)).toBeUndefined();
    });
  });

  describe('fromFlat', () => {
    it('takes a flat route w/ hash refs', async () => {
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

    it('takes a flat route w/ sliceIds', async () => {
      const route = Route.fromFlat('/a(slice0,slice1)');
      const segment = route.segment(0);
      expect(segment).toEqual({
        tableKey: 'a',
        sliceIds: ['slice0', 'slice1'],
      });
      expect(route.flat).toBe('/a(slice0,slice1)');
    });

    it('takes a flat route w/ segments and w/ sliceIds', async () => {
      const route = Route.fromFlat('/a(slice0,slice1)/b/c(slice2,slice3)');
      const segmentA = route.segment(0);
      expect(segmentA).toEqual({
        tableKey: 'a',
        sliceIds: ['slice0', 'slice1'],
      });

      const segmentB = route.segment(1);
      expect(segmentB).toEqual({
        tableKey: 'b',
      });

      const segmentC = route.segment(2);
      expect(segmentC).toEqual({
        tableKey: 'c',
        sliceIds: ['slice2', 'slice3'],
      });

      expect(route.flat).toBe('/a(slice0,slice1)/b/c(slice2,slice3)');
    });

    it('takes a flat route w/ sliceIds and reference', async () => {
      const route = Route.fromFlat('/a(slice0,slice1)@hashA');
      const segment = route.segment(0);
      expect(segment).toEqual({
        tableKey: 'a',
        sliceIds: ['slice0', 'slice1'],
        aRef: 'hashA',
      });
      expect(route.flat).toBe('/a(slice0,slice1)@hashA');
    });

    it('takes a flat route w/ timeId refs', async () => {
      const route = Route.fromFlat('/a@timeId:123/b@timeId:456/c@timeId:789');
      expect(route.segments).toEqual([
        {
          tableKey: 'a',
          aInsertHistoryRef: 'timeId:123',
        },
        {
          tableKey: 'b',
          bInsertHistoryRef: 'timeId:456',
        },
        {
          tableKey: 'c',
          cInsertHistoryRef: 'timeId:789',
        },
      ]);
      expect(route.flat).toBe('/a@timeId:123/b@timeId:456/c@timeId:789');
    });
  });

  describe('isValid', () => {
    it('returns isValid of a route', () => {
      const route = Route.fromFlat('/a/b/c');
      expect(route.isValid).toBe(true);
      const invalidRoute = Route.fromFlat('///');
      expect(invalidRoute.isValid).toBe(false);
    });
  });

  describe('set/get/has propertyKey', () => {
    it('operates on property keys', () => {
      // Create a route with a property key
      const route = Route.fromFlat('/a/b/c');
      route.propertyKey = 'propertyKey';

      expect(route.hasPropertyKey).toBe(true);
      expect(route.propertyKey).toBe('propertyKey');
      expect(route.flat).toBe('/a/b/c/propertyKey');

      // Create a route without a property key
      const routeWithoutPropertyKey = Route.fromFlat('/a/b/c');
      expect(routeWithoutPropertyKey.hasPropertyKey).toBe(false);
      expect(routeWithoutPropertyKey.propertyKey).toBeUndefined();
      expect(routeWithoutPropertyKey.flat).toBe('/a/b/c');
    });
  });

  describe('toRouteWithProperty', () => {
    it('returns a route w/ property key set', () => {
      const route = Route.fromFlat('/a/b/c');
      expect(route.hasPropertyKey).toBe(false);

      const routeWithProperty = route.toRouteWithProperty();

      expect(routeWithProperty.hasPropertyKey).toBe(true);
      expect(routeWithProperty.propertyKey).toBe('c');
      expect(routeWithProperty.flat).toBe('/a/b/c');

      const routeWithPropertyAgain = routeWithProperty.toRouteWithProperty();
      expect(routeWithPropertyAgain).toBe(routeWithProperty);
    });
  });

  describe('toRouteWithoutProperty', () => {
    it('returns a route w/o property key set', () => {
      const route = Route.fromFlat('/a/b/c');
      route.propertyKey = 'propertyKey';
      expect(route.hasPropertyKey).toBe(true);

      const routeWithoutProperty = route.toRouteWithoutProperty();

      expect(routeWithoutProperty.hasPropertyKey).toBe(false);
      expect(routeWithoutProperty.propertyKey).toBeUndefined();
      expect(routeWithoutProperty.flat).toBe('/a/b/c');

      const routeWithoutPropertyAgain =
        routeWithoutProperty.toRouteWithoutProperty();
      expect(routeWithoutPropertyAgain).toBe(routeWithoutProperty);
    });
  });

  describe('flat', () => {
    it('returns a flat representation w/ propertyKey', () => {
      const route = Route.fromFlat('/a/b/c');
      route.propertyKey = 'propertyKey';
      expect(route.flat).toBe('/a/b/c/propertyKey');
    });

    it('returns a flat representation w/o propertyKey', () => {
      const route = Route.fromFlat('/a/b/c');
      expect(route.flatWithoutPropertyKey).toBe('/a/b/c');

      route.propertyKey = 'propertyKey';
      expect(route.flatWithoutPropertyKey).toBe('/a/b/c');
      expect(route.flat).toBe('/a/b/c/propertyKey');
    });

    it('returns a flat representation w/o refs', () => {
      const route = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
      expect(route.flatWithoutRefs).toBe('/a/b/c');

      route.propertyKey = 'propertyKey';
      expect(route.flatWithoutRefs).toBe('/a/b/c/propertyKey');
      expect(route.flat).toBe('/a@hashA/b@hashB/c@hashC/propertyKey');
    });
  });

  describe('segment & segments', () => {
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

    it('returns any segment of a route', () => {
      const route = Route.fromFlat('/a/b/c');

      expect(route.segment(0)).toEqual({ tableKey: 'a' });
      expect(route.segment()).toEqual({ tableKey: 'c' });
    });
  });

  describe('root, top, deeper, upper, isRoot', () => {
    it('returns root segment of a route', () => {
      const route = Route.fromFlat('/parent/root');

      expect(route.root).toEqual({ tableKey: 'root' });
    });
    it('returns top segment of a route', () => {
      const route = Route.fromFlat('/parent/root');

      expect(route.top).toEqual({ tableKey: 'parent' });
    });
    it('returns deeper instance of a route', () => {
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
    it('returns deeper instance of a route w/ property', () => {
      const routeTopLevel = Route.fromFlat('/a/b/c');
      routeTopLevel.propertyKey = 'propertyKey';

      const routeMiddleLevel = routeTopLevel.deeper();
      const routeRootLevel = routeTopLevel.deeper(2);

      expect(() => routeTopLevel.deeper(0)).toThrowError(
        'Steps must be greater than 0',
      );
      expect(() => routeTopLevel.deeper(3)).toThrowError(
        'Cannot go deeper than the root',
      );

      expect(routeTopLevel.flat).toBe('/a/b/c/propertyKey');
      expect(routeMiddleLevel.flat).toBe('/b/c/propertyKey');
      expect(routeMiddleLevel.propertyKey).toBe('propertyKey');
      expect(routeRootLevel.flat).toBe('/c/propertyKey');
      expect(routeRootLevel.propertyKey).toBe('propertyKey');
      expect(routeRootLevel.isRoot).toBe(true);
    });

    it('returns upper instance of a route', () => {
      const routeRootLevel = Route.fromFlat('/a/b/c');
      const routeMiddleLevel = routeRootLevel.upper();
      const routeTopLevel = routeRootLevel.upper(2);

      expect(() => routeRootLevel.upper(0)).toThrowError(
        'Steps must be greater than 0',
      );
      expect(() => routeRootLevel.upper(3)).toThrowError(
        'Cannot go upper than the top level',
      );

      expect(routeRootLevel.flat).toBe('/a/b/c');
      expect(routeMiddleLevel.flat).toBe('/a/b');
      expect(routeTopLevel.flat).toBe('/a');
      expect(routeTopLevel.isRoot).toBe(true);
    });

    it('returns last segment of a route', () => {
      const route = Route.fromFlat('/a/b/c');

      expect(route.isRoot).toBe(false);
    });
  });
  describe('equals', () => {
    it('compares two routes for equality', () => {
      const routeA = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
      const routeB = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
      const routeC = Route.fromFlat('/a@hashA/b@hashB/c@hashD');

      expect(routeA.equals(routeB)).toBe(true);
      expect(routeA.equals(routeC)).toBe(false);
    });
  });

  describe('includes', () => {
    it('checks if a route includes another route', () => {
      const routeA = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
      const routeB = Route.fromFlat('/a@hashA/b@hashB');
      const routeC = Route.fromFlat('/a@hashA/b@hashX');
      const routeD = Route.fromFlat('/a@hashA/b@hashB/c@hashC/d@hashD');
      const routeE = Route.fromFlat('/a@hashA/c@hashX');

      expect(routeA.includes(routeB)).toBe(false);
      expect(routeB.includes(routeA)).toBe(true);
      expect(routeC.includes(routeA)).toBe(false);
      expect(routeB.includes(routeD)).toBe(true);
      expect(routeE.includes(routeA)).toBe(false);
    });
  });

  describe('equalsWithoutPropertyKey', () => {
    it('compares two routes for equality without property key', () => {
      const routeA = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
      routeA.propertyKey = 'someProperty';
      const routeB = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
      routeB.propertyKey = 'anotherProperty';
      const routeC = Route.fromFlat('/a@hashA/b@hashB/c@hashD');
      routeC.propertyKey = 'someProperty';

      expect(routeA.equalsWithoutPropertyKey(routeB)).toBe(true);
      expect(routeA.equalsWithoutPropertyKey(routeC)).toBe(false);
    });
  });

  describe('equalsWithoutRefs', () => {
    it('compares two routes for equality without refs', () => {
      const routeA = Route.fromFlat('/a@hashA/b@hashB/c@hashC');
      const routeB = Route.fromFlat('/a@hashX/b@hashY/c@hashZ');
      const routeC = Route.fromFlat('/a@hashA/b@hashB/d@hashC');
      const routeD = Route.fromFlat('/a/b');

      expect(routeA.equalsWithoutRefs(routeB)).toBe(true);
      expect(routeA.equalsWithoutRefs(routeC)).toBe(false);
      expect(routeA.equalsWithoutRefs(routeD)).toBe(false);
    });
  });
});
