// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  exampleRljson,
  exampleRljsonEmpty,
  exampleRljsonWithErrors,
} from '../src/rljson.ts';

describe('Rljson', () => {
  describe('exampleRljson()', () => {
    it('returns a table with one complex row', async () => {
      expect(exampleRljson()).toEqual({
        table: {
          _data: [
            {
              array: [
                1,
                'a',
                true,
                null,
                [1, 'a', true, null],
                {
                  a: 1,
                },
              ],
              boolean: true,
              double: 5.5,
              int: 5,
              null: null,
              object: {
                a: 1,
                b: {
                  c: 2,
                },
              },
              string: 'a',
            },
          ],
          _type: 'properties',
        },
      });
    });
  });

  describe('exampleRljsonEmpty()', () => {
    it('returns an empty table', async () => {
      expect(exampleRljsonEmpty()).toEqual({});
    });
  });

  describe('exampleRljsonWithErrors()', () => {
    it('throws an error', async () => {
      expect(exampleRljsonWithErrors()).toEqual({
        brok$en: {
          _data: [],
          _type: 'properties',
        },
      });
    });
  });
});
