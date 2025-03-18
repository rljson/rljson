// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleTableCfgTable } from '../../src/content/table-cfg';

import { expectGolden } from '../setup/goldens';

describe('TableCfg', () => {
  it('exampleTableCfgTable', () => {
    expectGolden('content/table-cfg-table.json').toBe(exampleTableCfgTable());
  });
});
