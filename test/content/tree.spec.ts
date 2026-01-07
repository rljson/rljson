// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { createTreesTableCfg, exampleTreesTable } from '../../src/content/tree.ts';

import { expectGolden } from '../setup/goldens.ts';


describe('TreesTable', () => {
  it('provides a simple tree w/ one root and one child', async () => {
    const tree = exampleTreesTable();
    await expectGolden('content/tree.json').toBe(tree);
  });
});
describe('createTreesTableCfg', () => {
  it('provides a sample Tree TableCfg', async () => {
    const tableCfg = createTreesTableCfg('example');
    await expectGolden('content/trees-table-cfg.json').toBe(tableCfg);
  });
});
