// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Example } from '../src/example.ts';
import { exampleRljson, iterateTables } from '../src/rljson.ts';

import { expectGolden } from './setup/goldens.ts';

describe('Rljson', () => {
  it('exampleRljson()', async () => {
    await expectGolden('rljson/example-rljson.json').toBe(exampleRljson());
  });

  describe('iterate', () => {
    it('returns over all public tables', async () => {
      const tableNames: string[] = [];
      iterateTables(Example.ok.bakery(), (tableName) => {
        tableNames.push(tableName);
      });

      expect(tableNames).toEqual([
        'idSets',
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
