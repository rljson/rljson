// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { bakeryExample } from '../../src/example/bakery-example';

import { expectGolden } from '../setup/goldens';

describe('bakeryExample', async () => {
  it('should be a bakery example', async () => {
    await expectGolden('example/bakery-example.json').toBe(bakeryExample);
  });
});
