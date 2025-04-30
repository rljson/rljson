// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip, rmhsh } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import {
  addColumnsToTableCfg,
  ColumnCfg,
  exampleTableCfg,
  exampleTableCfgTable,
  TableCfg,
  throwOnInvalidTableCfg,
} from '../../src/content/table-cfg';

import { expectGolden } from '../setup/goldens';

describe('TableCfg', () => {
  it('exampleTableCfgTable', () => {
    expectGolden('content/table-cfg-table.json').toBe(exampleTableCfgTable());
  });

  describe('throwOnInvalidTableCfg', () => {
    describe('throws an error if', () => {
      it('the table has less than 2 columns', () => {
        const tableCfg = exampleTableCfg({
          columns: [{ key: '_hash', type: 'string' }],
        });
        expect(() => throwOnInvalidTableCfg(tableCfg)).toThrow(
          'Invalid table configuration: ' +
            'Table "table" must have at least a _hash and a second column',
        );
      });

      it('the first column is not a _hash column', () => {
        const tableCfg = exampleTableCfg({
          columns: [
            { key: 'a', type: 'string' },
            { key: 'b', type: 'string' },
          ],
        });
        expect(() => throwOnInvalidTableCfg(tableCfg)).toThrow(
          'Invalid table configuration: The first column of table "table" must be "_hash"',
        );
      });

      it('the first column is not of type string', () => {
        const tableCfg = exampleTableCfg({
          columns: [
            { key: '_hash', type: 'number' },
            { key: 'b', type: 'string' },
          ],
        });
        expect(() => throwOnInvalidTableCfg(tableCfg)).toThrow(
          'Invalid table configuration: The first _hash column of table "table" must be of type "string"',
        );
      });

      it('a column has an unsupported type', () => {
        const tableCfg = exampleTableCfg({
          columns: [
            { key: '_hash', type: 'string' },
            { key: 'b', type: 'unknown' as any },
          ],
        });
        expect(() => throwOnInvalidTableCfg(tableCfg)).toThrow(
          'Invalid table configuration: Column "b" of table "table" has an unsupported type "unknown"',
        );
      });
    });
  });

  describe('addColumnsToTableCfg', () => {
    it('adds columns to the table configuration', () => {
      const tableCfg = hip(
        exampleTableCfg({
          columns: [
            { key: '_hash', type: 'string' },
            { key: 'a', type: 'string' },
          ],
        }),
      );

      const newColumns: ColumnCfg[] = [
        { key: 'b', type: 'number' },
        { key: 'c', type: 'boolean' },
      ];

      const updatedTableCfg = rmhsh(addColumnsToTableCfg(tableCfg, newColumns));

      expect(updatedTableCfg).toEqual({
        columns: [
          {
            key: '_hash',
            type: 'string',
          },
          {
            key: 'a',
            type: 'string',
          },
          {
            key: 'b',
            type: 'number',
          },
          {
            key: 'c',
            type: 'boolean',
          },
        ],
        isHead: true,
        isRoot: true,
        isShared: false,
        key: 'table',
        type: 'ingredients',
      });
    });

    it('throws an error if the columns already exist', () => {
      const tableCfg = exampleTableCfg();

      const newColumns: ColumnCfg[] = [
        { key: '_hash', type: 'string' },
        { key: 'a', type: 'string' },
        { key: 'b', type: 'string' },
      ];

      expect(() => addColumnsToTableCfg(tableCfg, newColumns)).toThrow(
        'The following columns already exist in the table "table": _hash, a',
      );
    });
  });

  it('exampleTableCfg', () => {
    const partialCfg: Partial<TableCfg> = {
      key: 'customTable',
      columns: [
        {
          key: 'c',
          type: 'boolean',
        },
      ],
      type: 'ingredients',
    };

    const result = exampleTableCfg(partialCfg);

    expect(result.key).toBe('customTable');
    expect(result.columns).toEqual([
      {
        key: 'c',
        type: 'boolean',
      },
    ]);
    expect(result.type).toBe('ingredients');
  });

  it('exampleTableCfg with default values', () => {
    const result = exampleTableCfg();
    throwOnInvalidTableCfg(result);

    expect(result.key).toBe('table');
    expect(result.columns).toEqual([
      {
        key: '_hash',
        type: 'string',
      },
      {
        key: 'a',
        type: 'string',
      },
      {
        key: 'b',
        type: 'number',
      },
    ]);
    expect(result.type).toBe('ingredients');
  });
});
