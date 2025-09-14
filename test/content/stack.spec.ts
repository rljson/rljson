// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleStack } from '../../src/content/stack.ts';

import { expectGolden } from '../setup/goldens.ts';


describe('Stack', () => {
  it('provides stack', async () => {
    await expectGolden('content/stack.json').toBe(exampleStack());
  });
});
