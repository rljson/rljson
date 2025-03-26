// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleSliceIdsTable } from '../../src/content/slice-ids.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('SliceIdsTable', () => {
  it('provides a list of slice-idss', async () => {
    await expectGolden('content/slice-idss.json').toBe(exampleSliceIdsTable());
  });
});
