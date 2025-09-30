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
  constructor(private segments: string[]) {}

  static fromFlat(route: string) {
    return new Route(route.split('/').filter(Boolean));
  }

  public segment(index?: number) {
    if (index === undefined) {
      return this.segments[this.segments.length - 1];
    }
    return this.segments[index];
  }

  public deeper(steps?: number) {
    if (steps === undefined) {
      return new Route(this.segments.slice(1, this.segments.length));
    } else {
      if (steps < 1) {
        throw new Error('Steps must be greater than 0');
      }
      if (steps >= this.segments.length) {
        throw new Error('Cannot go deeper than the root');
      }

      return new Route(this.segments.slice(steps, this.segments.length));
    }
  }

  get isRoot() {
    return this.segments.length === 1;
  }

  get flat() {
    return '/' + this.segments.join('/');
  }
}
