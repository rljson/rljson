// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { exampleJsonObject } from '@rljson/json';

import { bakeryExample } from './example/bakery-example.ts';
import { Rljson } from './rljson.ts';

/**
 * Provides Rljson examples
 */
export class Example {
  /**
   * Returns the Rljson bakery example
   */
  static bakery(): Rljson {
    return bakeryExample;
  }

  /**
   * Returns an Rljson object with one row containing all JSON types
   */
  static withAllJsonTypes(): Rljson {
    return {
      table: {
        _type: 'properties',
        _data: [exampleJsonObject()],
      },
    };
  }

  /**
   * Returns an empty Rljson object
   */
  static empty(): Rljson {
    return {};
  }

  /**
   * Returns an Rljson with a table containing all combinations of true and
   * false. This is useful for testing search operators.
   */
  static binary(): Rljson {
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
  }

  /**
   * An more complex example containing an table with multiple rows
   */
  static multiRow(): Rljson {
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
  }

  /**
   * Returns an Rljson object with a broken table name
   */
  static withBrokenTableName(): Rljson {
    return {
      brok$en: {
        _type: 'properties',
        _data: [],
      },
    };
  }
}
