// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleComponentsTable } from '../../src/content/components.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('ComponentsTable', () => {
  it('provides a list of components', async () => {
    await expectGolden('content/components.json').toBe(
      exampleComponentsTable(),
    );
  });
});
