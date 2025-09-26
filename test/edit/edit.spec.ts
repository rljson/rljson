// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleEditsTable } from '../../src/edit/edit.ts';

import { expectGolden } from '../setup/goldens.ts';

describe('EditsTable', () => {
  it('provides a list of edits', async () => {
    await expectGolden('edit/edits.json').toBe(exampleEditsTable());
  });
});
