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
      Example.ok.singleRow(),
    );
  });

  it('empty', () => {
    expect(Example.ok.empty()).toEqual({});
  });

  it('bakery', async () => {
    await expectGolden('example/bakery.json').toBe(Example.ok.bakery());
  });

  it('binary', async () => {
    await expectGolden('example/binary.json').toBe(Example.ok.binary());
  });

  it('multiRow', async () => {
    await expectGolden('example/multi-row.json').toBe(
      Example.ok.multipleRows(),
    );
  });

  describe('with', async () => {
    it('brokenTableName', async () => {
      expect(Example.broken.brokenTableName()).toEqual({
        brok$en: {
          _type: 'properties',
          _data: [],
        },
      });
    });

    it('missingData', async () => {
      expect(Example.broken.missingData()).toEqual({
        table: {
          _type: 'properties',
        },
      });
    });

    it('dataNotBeingAnArray', async () => {
      expect(Example.broken.dataNotBeingAnArray()).toEqual({
        table: {
          _type: 'properties',
          _data: {},
        },
      });
    });
  });
});
