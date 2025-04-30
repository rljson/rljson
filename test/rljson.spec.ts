// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { Example } from '../src/example.ts';
import {
  exampleRljson,
  iterateTables,
  iterateTablesSync,
  reservedFieldNames,
  reservedTableKeys,
} from '../src/rljson.ts';

import { expectGolden } from './setup/goldens.ts';

describe('Rljson', () => {
  it('exampleRljson()', async () => {
    await expectGolden('rljson/example-rljson.json').toBe(exampleRljson());
  });

  it('reservedFieldNames', () => {
    expect(reservedFieldNames).toEqual(['_data']);
  });

  it('reservedTableKeys', () => {
    expect(reservedTableKeys).toEqual([
      '_hash',
      'sliceIds',
      'tableCfgs',
      'reverseRefs',
      'revisions',
    ]);
  });

  describe('iterateTablesSync', () => {
    it('returns over all public tables', async () => {
      const tableKeys: string[] = [];
      iterateTablesSync(Example.ok.bakery(), (tableKey) => {
        tableKeys.push(tableKey);
      });

      expect(tableKeys).toEqual([
        'buffets',
        'cakes',
        'slices',
        'ingredientTypes',
        'layers',
        'recipes',
        'recipeIngredients',
        'ingredients',
        'nutritionalValues',
      ]);
    });
  });

  describe('iterateTables', () => {
    it('returns over all public tables', async () => {
      const tableKeys: string[] = [];
      await iterateTables(Example.ok.bakery(), async (tableKey: string) => {
        // Wait a millisecond to simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 1));

        // Push the table key to the array
        tableKeys.push(tableKey);
      });

      expect(tableKeys).toEqual([
        'buffets',
        'cakes',
        'slices',
        'ingredientTypes',
        'layers',
        'recipes',
        'recipeIngredients',
        'ingredients',
        'nutritionalValues',
      ]);
    });

    it('handles exceptions correctly', async () => {
      let error: any = null;

      try {
        await iterateTables(
          hip(Example.ok.bakery()),
          async (tableKey: string) => {
            // Wait a millisecond to simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 1));

            // Push the table key to the array
            throw new Error('Test error: ' + tableKey);
          },
        );
      } catch (err) {
        // Handle the error
        error = err;
      }

      expect(error).toEqual([
        {
          error: new Error('Test error: buffets'),
          tableKey: 'buffets',
        },
        {
          error: new Error('Test error: cakes'),
          tableKey: 'cakes',
        },
        {
          error: new Error('Test error: slices'),
          tableKey: 'slices',
        },
        {
          error: new Error('Test error: ingredientTypes'),
          tableKey: 'ingredientTypes',
        },
        {
          error: new Error('Test error: layers'),
          tableKey: 'layers',
        },
        {
          error: new Error('Test error: recipes'),
          tableKey: 'recipes',
        },
        {
          error: new Error('Test error: recipeIngredients'),
          tableKey: 'recipeIngredients',
        },
        {
          error: new Error('Test error: ingredients'),
          tableKey: 'ingredients',
        },
        {
          error: new Error('Test error: nutritionalValues'),
          tableKey: 'nutritionalValues',
        },
      ]);
    });
  });
});
