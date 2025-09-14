// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { Example } from '../src/example.ts';
import {
  exampleRljson, iterateTables, iterateTablesSync, reservedFieldNames, reservedTableKeys
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
      'tableCfgs',
      'reverseRefs',
      'revisions',
    ]);
  });

  describe('iterateTablesSync', () => {
    it('returns over all public tables', async () => {
      const tableKeys: string[] = [];
      iterateTablesSync(Example.ok.cars(), (tableKey) => {
        tableKeys.push(tableKey);
      });

      expect(tableKeys).toEqual([
        'carIndex',
        'carGeneral',
        'carTechnical',
        'carColor',
        'carIndexLayer',
        'carGeneralLayer',
        'carTechnicalLayer',
        'carColorLayer',
        'carRepository',
        'carIndexStack',
        'carGeneralStack',
        'carTechnicalStack',
        'carColorStack',
        'wheelIndex',
        'wheelManufacturer',
        'wheelDimension',
        'wheelIndexLayer',
        'wheelManufacturerLayer',
        'wheelDimensionLayer',
        'wheelIndexStack',
        'wheelManufacturerStack',
        'wheelDimensionStack',
        'wheelRepository',
        'car2WheelLayer',
        'car2WheelStack',
      ]);
    });
  });

  describe('iterateTables', () => {
    it('returns over all public tables', async () => {
      const tableKeys: string[] = [];
      await iterateTables(Example.ok.cars(), async (tableKey: string) => {
        // Wait a millisecond to simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 1));

        // Push the table key to the array
        tableKeys.push(tableKey);
      });

      expect(tableKeys).toEqual([
        'carIndex',
        'carGeneral',
        'carTechnical',
        'carColor',
        'carIndexLayer',
        'carGeneralLayer',
        'carTechnicalLayer',
        'carColorLayer',
        'carRepository',
        'carIndexStack',
        'carGeneralStack',
        'carTechnicalStack',
        'carColorStack',
        'wheelIndex',
        'wheelManufacturer',
        'wheelDimension',
        'wheelIndexLayer',
        'wheelManufacturerLayer',
        'wheelDimensionLayer',
        'wheelIndexStack',
        'wheelManufacturerStack',
        'wheelDimensionStack',
        'wheelRepository',
        'car2WheelLayer',
        'car2WheelStack',
      ]);
    });

    it('handles exceptions correctly', async () => {
      let error: any = null;

      try {
        await iterateTables(
          hip(Example.ok.cars()),
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

      //error: new Error('Test error: buffets'),

      const expectation = Object.entries(Example.ok.cars()).map(([k]) =>
        Object.assign({
          tableKey: k,
          error: new Error('Test error: ' + k),
        }),
      );

      expect(error).toEqual(expectation);
    });
  });
});
