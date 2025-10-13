// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

// Utility to calculate the depth of a nested object
export const objectDepth = (o: object): number =>
  Object(o) === o ? 1 + Math.max(-1, ...Object.values(o).map(objectDepth)) : 0;
