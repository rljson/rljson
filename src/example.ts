// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { exampleJsonObject } from '@rljson/json';

import { Rljson } from './rljson.ts';

/**
 * Provides Rljson examples
 */

export class Example {
  static withAllJsonTypes(): Rljson {
    return {
      table: {
        _type: 'properties',
        _data: [exampleJsonObject()],
      },
    };
  }

  static empty(): Rljson {
    return Example._empty();
  }

  static bakery(): Rljson {
    return Example._complete();
  }

  static binary(): Rljson {
    return Example._binary();
  }

  static multiRow(): Rljson {
    return Example._multiRow();
  }

  static withErrors(): Rljson {
    return Example._errors();
  }

  // ######################
  // Private
  // ######################

  private static _complete(): Rljson {
    return {};
  }

  private static _empty(): Rljson {
    return {};
  }

  private static _binary(): Rljson {
    return {
      table: {
        _type: 'properties',
        _data: [
          { a: 0, b: 0 },
          { a: 0, b: 1 },
          { a: 1, b: 0 },
          { a: 1, b: 1 },
        ],
      },
    };
  }

  private static _multiRow(): Rljson {
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

  private static _errors(): Rljson {
    return {
      brok$en: {
        _type: 'properties',
        _data: [],
      },
    };
  }
}
