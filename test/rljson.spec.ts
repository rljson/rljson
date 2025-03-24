// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Example } from '../src/example.ts';
import {
  exampleRljson,
  iterateTables,
  reservedFieldNames,
  reservedTableKeys,
} from '../src/rljson.ts';

import { expectGolden } from './setup/goldens.ts';

describe('Rljson', () => {
  it('exampleRljson()', async () => {
    await expectGolden('rljson/example-rljson.json').toBe(exampleRljson());
  });

  it('reservedFieldNames', () => {
    expect(reservedFieldNames).toEqual(['_type', '_data']);
  });

  it('reservedTableKeys', () => {
    expect(reservedTableKeys).toEqual(['_hash', 'idSets', 'tableCfgs']);
  });

  describe('iterate', () => {
    it('returns over all public tables', async () => {
      const tableKeys: string[] = [];
      iterateTables(Example.ok.bakery(), (tableKey) => {
        tableKeys.push(tableKey);
      });

      expect(tableKeys).toEqual([
        'buffets',
        'cakes',
        'slices',
        'layers',
        'recipes',
        'recipeIngredients',
        'ingredients',
        'nutritionalValues',
      ]);
    });
  });
});
