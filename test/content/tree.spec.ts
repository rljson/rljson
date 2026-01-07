// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { createLayerTableCfg, exampleLayersTable } from '../../src/content/layer.ts';

import { expectGolden } from '../setup/goldens.ts';


describe('TreesTable', () => {
  it('provides a list of layers', async () => {
    const json = exampleLayersTable();
    await expectGolden('content/layers.json').toBe(json);
  });
});
describe('createLayersTableCfg', () => {
  it('provides a sample Layers TableCfg', async () => {
    const tableCfg = createLayerTableCfg('example');
    await expectGolden('content/layers-table-cfg.json').toBe(tableCfg);
  });
});
