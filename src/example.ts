// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { exampleJsonObject } from '@rljson/json';

import { bakeryExample } from './example/bakery-example.ts';
import { Rljson } from './rljson.ts';

export class Example {
  static readonly ok = {
    bakery: (): Rljson => bakeryExample(),

    empty: (): Rljson => {
      return {};
    },

    binary: (): Rljson => {
      return {
        table: {
          _type: 'properties',
          _data: [
            { a: false, b: false },
            { a: false, b: true },
            { a: true, b: false },
            { a: true, b: true },
          ],
        },
      };
    },

    singleRow: (): Rljson => {
      return {
        table: {
          _type: 'properties',
          _data: [exampleJsonObject()],
        },
      };
    },

    multipleRows: (): Rljson => {
      return {
        table: {
          _type: 'properties',
          _data: [
            {
              string: 'str0',
              boolean: true,
              number: 1,
              array: [1, 'str0', true, { a: { b: 'c' } }],
              object: { a: { b: 'c' } },
            },

            {
              string: 'str1',
              boolean: true,
              number: 1,
              array: [1, 'str1', true, { a: { b: 'c' } }],
              object: { a: { b: 'c' } },
            },

            {
              string: 'str2',
              boolean: false,
              number: 1,
              array: [1, 'str1', true, { a: { b: 'c' } }],
              object: { d: { e: 'f' } },
            },
          ],
        },
      };
    },

    singleRef: (): Rljson => {
      return {
        tableA: {
          _type: 'properties',
          _data: [
            {
              keyA0: 'a0',
            },
            {
              keyA1: 'a1',
            },
          ],
        },
        tableB: {
          _type: 'properties',
          _data: [
            {
              tableARef: 'KFQrf4mEz0UPmUaFHwH4T6',
            },
          ],
        },
      };
    },
    complete: (): Rljson => {
      return {
        _idSets: {
          _type: 'idSets',

          _data: [
            {
              add: ['id0', 'id1'],
              _hash: 'MgHRBYSrhpyl4rvsOmAWcQ',
            },
          ],
        },

        properties: {
          _type: 'properties',
          _data: [
            { a: '0', _hash: 'AFhW-fMzdCiz6bUZscp1Lf' },
            { a: '1', _hash: 'mv6w8rID8lQxLsje1EHQMY' },
          ],
        },

        collections: {
          _type: 'collections',
          _data: [
            {
              idSet: 'MgHRBYSrhpyl4rvsOmAWcQ',
              properties: 'properties',
              _hash: 'sxv2NCM6UNOcX-i9FhOs5W',
              assign: {},
            },
            {
              base: 'sxv2NCM6UNOcX-i9FhOs5W',
              idSet: 'MgHRBYSrhpyl4rvsOmAWcQ',
              properties: 'properties',
              assign: {
                id0: 'AFhW-fMzdCiz6bUZscp1Lf',
                id1: 'mv6w8rID8lQxLsje1EHQMY',
              },
              _hash: 'QB2JC6X_-rUAoixuldzWP-',
            },
          ],
        },

        cakes: {
          _type: 'cakes',
          _data: [
            {
              idSet: 'MgHRBYSrhpyl4rvsOmAWcQ',
              collections: 'collections',
              layers: {
                layer0: 'sxv2NCM6UNOcX-i9FhOs5W',
                layer1: 'QB2JC6X_-rUAoixuldzWP-',
              },
            },
          ],
        },
      };
    },
  };

  static readonly broken = {
    brokenTableName: () => {
      return {
        brok$en: {
          _type: 'properties',
          _data: [],
        },
      };
    },

    missingData: () => {
      return {
        table: {
          _type: 'properties',
        },
      } as unknown as Rljson;
    },

    dataNotBeingAnArray: () => {
      return {
        table: {
          _type: 'properties',
          _data: {},
        },
      } as unknown as Rljson;
    },

    missingRef: (): Rljson => {
      return {
        tableA: {
          _type: 'properties',
          _data: [
            {
              keyA0: 'a0',
            },
            {
              keyA1: 'a1',
            },
          ],
        },
        tableB: {
          _type: 'properties',
          _data: [
            {
              tableARef: 'MISSINGREF', // MISSINGREF does not exist in tableA
            },
          ],
        },
      };
    },

    missingReferencedTable: (): Rljson => {
      return {
        tableB: {
          _type: 'properties',
          _data: [
            {
              tableARef: 'MISSINGREF', // tableA is missing
            },
          ],
        },
      };
    },

    collections: {
      missingBase: (): Rljson => {
        const result = Example.ok.complete();
        result.collections._data[1].base = 'MISSING'; // Missing base
        return hip(result, true, false);
      },

      missingIdSet: (): Rljson => {
        const result = Example.ok.complete();
        const collection0 = result.collections._data[0];
        const collection1 = result.collections._data[1];

        collection0.idSet = 'MISSING0'; // Missing ID set
        collection1.idSet = 'MISSING1'; // Missing ID set

        hip(collection0, true, false);
        collection1.base = collection0._hash;

        return hip(result, true, false);
      },

      missingAssignedPropertyTable: (): Rljson => {
        const result = Example.ok.complete();
        delete result.properties; // Remove properties table
        return result;
      },

      missingAssignedProperty: (): Rljson => {
        const result = Example.ok.complete();
        result.properties._data.splice(1, 2); // Remove an property that is assigne
        return result;
      },
    },

    cake: {
      missingIdSet: (): Rljson => {
        const result = Example.ok.complete();
        result.cakes._data[0].idSet = 'MISSING'; // Missing ID set
        return result;
      },

      missingCollectionsTable: (): Rljson => {
        const result = Example.ok.complete();
        result.cakes._data[0].collections = 'MISSING'; // Missing collections table
        return result;
      },
    },
  };
}
