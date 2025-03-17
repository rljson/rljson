// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

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

    collection: (): Rljson => {
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

        collection: {
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

    collection: {
      missingBase: (): Rljson => {
        const result = Example.ok.collection();
        result.collection._data.splice(0, 1); // Remove base
        return result;
      },

      missingIdSet: (): Rljson => {
        const result = Example.ok.collection();
        result._idSets._data.splice(0, 1); // Remove id set
        return result;
      },

      missingAssignedPropertyTable: (): Rljson => {
        const result = Example.ok.collection();
        delete result.properties; // Remove properties table
        return result;
      },

      missingAssignedProperty: (): Rljson => {
        const result = Example.ok.collection();
        result.properties._data.splice(1, 2); // Remove an property that is assigne
        return result;
      },
    },
  };
}
