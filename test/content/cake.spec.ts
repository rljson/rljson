// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleCakesTable } from '../../src/content/cake.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('CakesTable', () => {
  it('provides a list of cakes', async () => {
    await expectGolden('content/cakes.json').toBe(exampleCakesTable());
  });
});
