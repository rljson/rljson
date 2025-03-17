import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { Example } from '../src/example';
import { iterate, Rljson } from '../src/rljson';
import { rljsonIndexed } from '../src/rljson-indexed';

import { expectGolden } from './setup/goldens';

// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

describe('RljsonIndexed', () => {
  it('should create indexes for all rows of all tables', () => {
    const updateExistingHashes = true;
    const throwOnWrongHashes = false;
    const bakery = hip(
      Example.bakery(),
      updateExistingHashes,
      throwOnWrongHashes,
    );
    const indexedBakery = rljsonIndexed(bakery);
    expectGolden('rljson-indexed.json').toBe(indexedBakery);

    // Check that all tables are indexed
    const tableNames = Object.keys(bakery);
    const tableNamesIndexed = Object.keys(indexedBakery);
    expect(tableNamesIndexed).toEqual(tableNames);

    // Iterate all tables
    iterate(bakery, (tableName, table) => {
      const tableIndexed = indexedBakery[tableName];

      // For each row of the table there is an index
      const hashes = Object.keys(tableIndexed._data);
      expect(table._data.length).toEqual(hashes.length);

      // Each row's hash is used as index
      for (const row of table._data) {
        const hash = row._hash;
        expect(tableIndexed._data[hash]).toBe(row);
      }
    });
  });

  it('just copies tables that have no data object', () => {
    const rljson: Rljson = {
      tableWithoutData: {
        _someField: 'someValue',
      },
    } as any;

    const indexedRljson = rljsonIndexed(rljson);
    expect(rljson.tableWithoutData).toBe(indexedRljson.tableWithoutData);
  });

  it('creates missing row hashes', () => {
    const rljson: Rljson = {
      tableWithMissingHashes: {
        _data: [{ a: 'a' }, { a: 'b' }],
      },
    } as any;

    const indexedRljson = rljsonIndexed(rljson);

    expect(indexedRljson).toEqual({
      tableWithMissingHashes: {
        _data: {
          '20p-yxFLxmxiOgbE_2_o2q': {
            _hash: '20p-yxFLxmxiOgbE_2_o2q',
            a: 'b',
          },
          aBUjYx4PXTkE2IHdFjaDCB: {
            _hash: 'aBUjYx4PXTkE2IHdFjaDCB',
            a: 'a',
          },
        },
      },
    });
  });
});
