// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleRljson } from '../src/rljson.ts';

import { expectGolden } from './setup/goldens.ts';

describe('Rljson', () => {
  it('exampleRljson()', async () => {
    await expectGolden('rljson/example-rljson.json').toBe(exampleRljson());
  });
});
