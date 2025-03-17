// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { exampleJsonObject } from '@rljson/json';

import { bakeryExample } from './example/bakery-example.ts';
import { Rljson } from './rljson.ts';

export class Example {
  // ...........................................................................
  static readonly bakery = (): Rljson => bakeryExample();

  // ...........................................................................
  static withAllJsonTypes = (): Rljson => {
    return {
      table: {
        _type: 'properties',
        _data: [exampleJsonObject()],
      },
    };
  };

  // ...........................................................................
  static readonly empty = (): Rljson => {
    return {};
  };

  // ...........................................................................
  static readonly binary = (): Rljson => {
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
  };

  // ...........................................................................
  static readonly multiRow = (): Rljson => {
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
  };

  // ######################
  // Broken examples
  // ######################

  // ...........................................................................
  static readonly with: { [table: string]: () => Rljson } = {
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
  };
}
