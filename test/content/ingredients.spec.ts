// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleIngredientsTable } from '../../src/content/ingredients.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('IngredientsTable', () => {
  it('provides a list of ingredients', async () => {
    await expectGolden('content/ingredients.json').toBe(
      exampleIngredientsTable(),
    );
  });
});
