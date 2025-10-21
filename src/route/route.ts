// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be

import { TableKey } from '../typedefs.ts';

// found in the LICENSE file in the root of this package.
export type RouteRef = string;

export type RouteSegment<Str extends string> = {
  [key in Str as `${Uncapitalize<string & key>}Ref`]: string;
} & {
  tableKey: TableKey;
};

export type RouteSegmentFlat<N extends string> =
  | `${N}`
  | `${N}@${string}`
  | `${N}@${string}:${string}`;

// .............................................................................
/**
 * A class to handle routes in an Rljson object.
 */
export class Route {
  constructor(private readonly _segments: RouteSegment<any>[]) {}

  // .............................................................................
  /**
   * Creates a Route from a flat string representation.
   * @param route - The flat string representation of the route (e.g. "/a/b/c")
   * @returns A Route object
   */
  static fromFlat(route: string) {
    const segmentsFlat = route
      .split('/')
      .filter((s) => s.length > 0) as RouteSegmentFlat<string>[];

    const segments: RouteSegment<any>[] = [];

    // Parse each segment and extract any references
    for (const segmentFlat of segmentsFlat) {
      const [tableKey, refFlat] = segmentFlat.split('@');

      const ref = !!refFlat
        ? refFlat.split(':').length == 2
          ? { [tableKey + 'HistoryRef']: refFlat }
          : { [tableKey + 'Ref']: refFlat }
        : {};

      const segment: RouteSegment<any> = {
        tableKey,
        ...ref,
      };

      segments.push(segment);
    }

    return new Route(segments);
  }

  // .............................................................................
  /**
   * Returns the segment at the given index or the last segment if no index is provided.
   * @param index - The index of the segment to return (optional)
   * @returns The segment at the given index or the last segment
   */
  public segment(index?: number): RouteSegment<any> {
    if (index === undefined) {
      return this._segments[this._segments.length - 1];
    }
    return this._segments[index];
  }

  // .............................................................................
  /**
   * Returns a new Route that is one level deeper than the current route.
   * If steps is provided, it returns a new Route that is 'steps' levels deeper.
   * @param steps - The number of levels to go deeper (optional)
   * @returns A new Route that is one level deeper or 'steps' levels deeper
   */
  public deeper(steps?: number): Route {
    if (steps === undefined) {
      return new Route(this._segments.slice(1, this._segments.length));
    } else {
      if (steps < 1) {
        throw new Error('Steps must be greater than 0');
      }
      if (steps >= this._segments.length) {
        throw new Error('Cannot go deeper than the root');
      }

      return new Route(this._segments.slice(steps, this._segments.length));
    }
  }

  // .............................................................................
  /**
   * Checks if the current route is the root route.
   * @returns True if the current route is the root route, false otherwise
   */
  get isRoot() {
    return this._segments.length === 1;
  }

  // .............................................................................
  /**
   * Returns the flat string representation of the route.
   * @returns The flat string representation of the route (e.g. "/a/b/c")
   */
  get flat() {
    let flat = '';
    for (const segment of this._segments) {
      const tableKey = segment.tableKey;
      const ref = Object.keys(segment).filter((k) => k !== 'tableKey')[0];
      flat += `/${tableKey}${ref ? `@${(segment as any)[ref]}` : ''}`;
    }
    return flat;
  }

  // .............................................................................
  /**
   * Returns the segments of the route as an array of strings.
   * @returns The segments of the route as an array of strings
   */
  get segments(): RouteSegment<any>[] {
    return this._segments;
  }

  // .............................................................................
  /**
   * Returns the root segment of the route.
   * @returns The root segment of the route
   */
  get root(): RouteSegment<any> {
    return this.segment();
  }

  // .............................................................................
  /**
   * Returns the top level segment of the route.
   * @returns The top level segment of the route
   */
  get top(): RouteSegment<any> {
    return this.segment(0);
  }

  // .............................................................................
  /**
   * Returns the next segment of the route if it exists.
   * @returns The next segment of the route or undefined if it doesn't exist
   */
  get next(): RouteSegment<any> | undefined {
    return this._segments.length > 1 ? this._segments[1] : undefined;
  }

  // .............................................................................
  /**
   * Checks if the route is valid (i.e. has at least one segment and no empty segments).
   * @returns True if the route is valid, false otherwise
   */
  get isValid() {
    return (
      this._segments.length > 0 &&
      this._segments.every((s) => s.tableKey.length > 0)
    );
  }

  // .............................................................................
  /**
   * Returns the reference of a segment if it exists.
   * @param segment - The segment to get the reference from
   * @returns The reference of the segment or undefined if it doesn't exist
   */
  static segmentRef(segment: RouteSegment<any>): string | undefined {
    if (this.segmentHasRef(segment)) {
      const refKey = Object.keys(segment).find(
        (k) => k.endsWith('Ref') && k !== 'tableKey',
      );
      if (refKey) {
        return (segment as any)[refKey];
      }
    }
    return undefined;
  }

  // .............................................................................
  /**
   * Checks if a segment has any reference (either default or history).
   * @param segment - The segment to check
   * @returns True if the segment has any reference, false otherwise
   */
  static segmentHasRef(segment: RouteSegment<any>): boolean {
    return Object.keys(segment).some((k) => k.endsWith('Ref'));
  }

  // .............................................................................
  /**
   * Checks if a segment has a default reference (i.e. not a history reference).
   * @param segment - The segment to check
   * @returns True if the segment has a default reference, false otherwise
   */
  static segmentHasDefaultRef(segment: RouteSegment<any>): boolean {
    return this.segmentHasRef(segment) && !this.segmentHasHistoryRef(segment);
  }

  // .............................................................................
  /**
   * Checks if a segment has a history reference (i.e. an HistoryRef).
   * @param segment - The segment to check
   * @returns True if the segment has a history reference, false otherwise
   */
  static segmentHasHistoryRef(segment: RouteSegment<any>): boolean {
    return (
      this.segmentHasRef(segment) &&
      Object.keys(segment).some((k) => k.endsWith('HistoryRef'))
    );
  }
}
