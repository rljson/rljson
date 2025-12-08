// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { createHeadsTableCfg } from '../../src/content/head';

import { expectGolden } from '../setup/goldens';

describe('Head', () => {
  describe('createHeadsTableCfg', () => {
    it('provides a TableCfg for HeadsTable', async () => {
      const json = createHeadsTableCfg('exampleCake');
      await expectGolden('content/createHeadsTableCfg.json').toBe(json);
    });
  });
});
