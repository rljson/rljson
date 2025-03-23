// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  exampleTableCfg,
  exampleTableCfgTable,
  TableCfg,
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
      type: 'properties',
    };

    const result = exampleTableCfg(partialCfg);

    expect(result.key).toBe('customTable');
    expect(result.columns).toEqual({
      c: {
        key: 'c',
        type: 'boolean',
      },
    });
    expect(result.type).toBe('properties');
  });

  it('exampleTableCfg with default values', () => {
    const result = exampleTableCfg();

    expect(result.key).toBe('table');
    expect(result.columns).toEqual({
      a: {
        key: 'a',
        type: 'string',
      },
      b: {
        key: 'b',
        type: 'number',
      },
    });
    expect(result.type).toBe('properties');
  });
});
