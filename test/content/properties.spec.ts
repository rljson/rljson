// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { examplePropertiesTable } from '../../src/content/properties.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('PropertiesTable', () => {
  it('provides a list of properties', async () => {
    await expectGolden('content/properties.json').toBe(examplePropertiesTable);
  });
});
