// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleSliceIdSetsTable } from '../../src/content/slice-id-set.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('SliceIdSetsTable', () => {
  it('provides a list of slice-id-sets', async () => {
    await expectGolden('content/slice-id-sets.json').toBe(
      exampleSliceIdSetsTable(),
    );
  });
});
