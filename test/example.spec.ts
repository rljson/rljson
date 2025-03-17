// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Example } from '../src/example';

import { expectGolden } from './setup/goldens';

describe('Example', () => {
  it('withAllJsonTypes', async () => {
    await expectGolden('example/with-all-json-types.json').toBe(
      Example.with.singleRow(),
    );
  });

  it('empty', () => {
    expect(Example.with.empty()).toEqual({});
  });

  it('bakery', async () => {
    await expectGolden('example/bakery.json').toBe(Example.with.bakery());
  });

  it('binary', async () => {
    await expectGolden('example/binary.json').toBe(Example.with.binary());
  });

  it('multiRow', async () => {
    await expectGolden('example/multi-row.json').toBe(
      Example.with.multipleRows(),
    );
  });

  describe('with', async () => {
    it('brokenTableName', async () => {
      expect(Example.withError.brokenTableName()).toEqual({
        brok$en: {
          _type: 'properties',
          _data: [],
        },
      });
    });

    it('missingData', async () => {
      expect(Example.withError.missingData()).toEqual({
        table: {
          _type: 'properties',
        },
      });
    });

    it('dataNotBeingAnArray', async () => {
      expect(Example.withError.dataNotBeingAnArray()).toEqual({
        table: {
          _type: 'properties',
          _data: {},
        },
      });
    });
  });
});
