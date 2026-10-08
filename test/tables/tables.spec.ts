// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Rljson } from '../../src/rljson.ts';
import { Tables } from '../../src/tables/tables.ts';

const cfg = (key: string, type: string, n: number) => ({
  key,
  type,
  columns: [{ key: '_hash', type: 'string', titleShort: `${n}` }],
  isHead: false,
  isRoot: false,
  isShared: true,
});

const rljson = {
  _hash: 'abc',
  tableCfgs: {
    _type: 'tableCfgs',
    _data: [
      cfg('cars', 'components', 1),
      cfg('carsInsertHistory', 'insertHistory', 1),
      cfg('cars', 'components', 2),
    ],
  },
  cars: { _type: 'components', _data: [{ a: 1 }, { a: 2 }] },
  carsInsertHistory: { _type: 'insertHistory', _data: [{}] },
  aLongerTableName: { _type: 'layers', _data: [] },
  _private: { _type: 'components', _data: [{}] },
} as unknown as Rljson;

describe('Tables', () => {
  const tables = new Tables(rljson);

  it('rljson', () => {
    expect(tables.rljson).toBe(rljson);
  });

  describe('ls()', () => {
    it('hides internal tables by default', () => {
      expect(tables.ls()).toEqual(['aLongerTableName', 'cars', 'tableCfgs']);
    });

    it('includes internal tables with internal: true', () => {
      expect(tables.ls({ internal: true })).toEqual([
        '_private',
        'aLongerTableName',
        'cars',
        'carsInsertHistory',
        'tableCfgs',
      ]);
    });

    it('returns aligned lines with long: true', () => {
      expect(tables.ls({ long: true })).toEqual([
        'aLongerTableName layers     0',
        'cars             components 2',
        'tableCfgs        tableCfgs  3',
      ]);
    });

    it('returns an empty list for an empty rljson', () => {
      expect(new Tables({} as Rljson).ls({ long: true })).toEqual([]);
    });
  });

  it('all', () => {
    expect(tables.all).toEqual([
      rljson.aLongerTableName,
      rljson.cars,
      rljson.tableCfgs,
    ]);
  });

  it('count', () => {
    expect(tables.count).toBe(3);
  });

  it('get() and has()', () => {
    expect(tables.get('cars')).toBe(rljson.cars);
    expect(tables.get('_hash')).toBeUndefined();
    expect(tables.get('unknown')).toBeUndefined();
    expect(tables.has('carsInsertHistory')).toBe(true);
    expect(tables.has('_hash')).toBe(false);
  });

  it('ofType()', () => {
    expect(tables.ofType('components')).toEqual(['_private', 'cars']);
    expect(tables.ofType('insertHistory')).toEqual(['carsInsertHistory']);
    expect(tables.ofType('cakes')).toEqual([]);
  });

  it('cfg() returns the latest cfg', () => {
    expect(tables.cfg('cars')?.columns[0].titleShort).toBe('2');
    expect(tables.cfg('unknown')).toBeUndefined();
    expect(new Tables({} as Rljson).cfg('cars')).toBeUndefined();
  });

  it('rowCount()', () => {
    expect(tables.rowCount('cars')).toBe(2);
    expect(tables.rowCount('unknown')).toBe(0);
  });
});
