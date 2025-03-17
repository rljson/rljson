// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleTypedefs } from '../src/typedefs';

import { expectGolden } from './setup/goldens';

describe('typedefs', async () => {
  it('exampleTypedefs', async () => {
    await expectGolden('typedefs.json').toBe(exampleTypedefs());
  });
});
