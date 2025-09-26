// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.
export class Route {
  constructor(private segments: string[]) {}

  static fromFlat(route: string) {
    return new Route(route.split('/').filter(Boolean));
  }

  get flat() {
    return '/' + this.segments.join('/');
  }
}
