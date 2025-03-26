// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleLayersTable } from '../../src/content/layer.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('LayersTable', () => {
  it('provides a list of layers', async () => {
    await expectGolden('content/layers.json').toBe(
      exampleLayersTable(),
    );
  });
});
