// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Validator } from '../src/validator';

describe('Validator', () => {
  it('should validate Rljson data', () => {
    const validator = new Validator();
    expect(validator).toBeDefined();
  });
});
