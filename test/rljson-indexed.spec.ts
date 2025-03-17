import { describe, it } from 'vitest';

import { Example } from '../src/example';
import { indexedRljson } from '../src/rljson-indexed.ts';

import { expectGolden } from './setup/goldens';

// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

describe('RljsonIndexed', () => {
  it('should create indexes for all rows of all tables', () => {
    const indexedBakery = indexedRljson(Example.bakery());
    expectGolden('rljson-indexed.json').toBe(indexedBakery);
  });
});
