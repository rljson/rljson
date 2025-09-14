// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hsh } from '@rljson/hash';

import { describe, it } from 'vitest';

import { carExample } from '../../src/example/cars-example';

import { expectGolden } from '../setup/goldens';


describe('carExample', async () => {
  it('should be a car example', async () => {
    const carExampleHashed = hsh(carExample() as any, {
      updateExistingHashes: true,
      throwOnWrongHashes: false,
    });
    await expectGolden('example/cars-example.json').toBe(carExampleHashed);
  });
});
