// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleBuffetsTable } from '../../src/content/buffet';

import { expectGolden } from '../setup/goldens';

describe('BuffetsTable', () => {
  it('provides a list of buffets', async () => {
    await expectGolden('content/buffets.json').toBe(exampleBuffetsTable);
  });
});
