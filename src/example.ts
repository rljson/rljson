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
  };
}
