// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.
export type RouteRef = string;

// .............................................................................
/**
 * A class to handle routes in an Rljson object.
 */
export class Route {
  constructor(private readonly _segments: string[]) {}

  // .............................................................................
  /**
   * Creates a Route from a flat string representation.
   * @param route - The flat string representation of the route (e.g. "/a/b/c")
   * @returns A Route object
   */
  static fromFlat(route: string) {
    return new Route(route.split('/').filter(Boolean));
  }

  // .............................................................................
  /**
   * Returns the segment at the given index or the last segment if no index is provided.
   * @param index - The index of the segment to return (optional)
   * @returns The segment at the given index or the last segment
   */
  public segment(index?: number): string {
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
  public deeper(steps?: number) {
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
    return '/' + this._segments.join('/');
  }

  // .............................................................................
  /**
   * Returns the segments of the route as an array of strings.
   * @returns The segments of the route as an array of strings
   */
  get segments() {
    return this._segments;
  }

  // .............................................................................
  /**
   * Returns the root segment of the route.
   * @returns The root segment of the route
   */
  get root() {
    return this.segment();
  }

  // .............................................................................
  /**
   * Checks if the route is valid (i.e. has at least one segment and no empty segments).
   * @returns True if the route is valid, false otherwise
   */
  get isValid() {
    return (
      this._segments.length > 0 && this._segments.every((s) => s.length > 0)
    );
  }
}
