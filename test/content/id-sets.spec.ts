// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleIdSetsTable } from '../../src/content/id-set.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('IdSetsTable', () => {
  it('provides a list of id-sets', async () => {
    await expectGolden('content/id-sets.json').toBe(exampleIdSetsTable);
  });
});
