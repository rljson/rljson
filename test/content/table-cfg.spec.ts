// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { beforeEach, describe, expect, it } from 'vitest';

import {
  exampleTableCfg,
  exampleTableCfgTable,
  TableCfg,
  TableCfgTools,
} from '../../src/content/table-cfg';

import { expectGolden } from '../setup/goldens';

describe('TableCfg', () => {
  it('exampleTableCfgTable', () => {
    expectGolden('content/table-cfg-table.json').toBe(exampleTableCfgTable());
  });
  it('exampleTableCfg', () => {
    const partialCfg: Partial<TableCfg> = {
      key: 'customTable',
      columns: {
        c: {
          key: 'c',
          type: 'boolean',
        },
      },
      type: 'ingredients',
    };

    const result = exampleTableCfg(partialCfg);

    expect(result.key).toBe('customTable');
    expect(result.columns).toEqual({
      c: {
        key: 'c',
        type: 'boolean',
      },
    });
    expect(result.type).toBe('ingredients');
  });

  it('exampleTableCfg with default values', () => {
    const result = exampleTableCfg();

    expect(result.key).toBe('table');
    expect(result.columns).toEqual({
      a: {
        type: 'string',
      },
      b: {
        type: 'number',
      },
    });
    expect(result.type).toBe('ingredients');
  });
});

describe('TableCfgTools', () => {
  let tableCfgTools: TableCfgTools;
  beforeEach(() => {
    tableCfgTools = new TableCfgTools(exampleTableCfg());
  });

  describe('columnKeys', () => {
    it('should return all column keys', () => {
      const expectedKeys = ['a', 'b'];
      const result = tableCfgTools.columnKeys;
      expect(result).toEqual(expectedKeys);
    });

    it('should not include keys that start with "_"', () => {
      const partialCfg: Partial<TableCfg> = {
        columns: {
          a: {
            type: 'string',
          },
          _hiddenColumn: {
            type: 'number',
          },
        },
      };
      tableCfgTools = new TableCfgTools(exampleTableCfg(partialCfg));
      const expectedKeys = ['a'];
      const result = tableCfgTools.columnKeys;
      expect(result).toEqual(expectedKeys);
    });
  });
});
