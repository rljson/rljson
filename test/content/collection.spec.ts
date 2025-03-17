// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleCollectionsTable } from '../../src/content/collection.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('CollectionsTable', () => {
  it('provides a list of collections', async () => {
    await expectGolden('content/collections.json').toBe(
      exampleCollectionsTable(),
    );
  });
});
