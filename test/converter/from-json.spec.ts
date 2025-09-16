// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import {
  exampleFromJsonDecomposeSheet, exampleFromJsonJson, fromJson
} from '../../src/converter/from-json';

import { expectGolden } from '../setup/goldens';


describe('From JSON', () => {
  it('provides a converter for JSON Format', async () => {
    const json = exampleFromJsonJson;
    const decomposeSheet = exampleFromJsonDecomposeSheet;

    const rljson = fromJson(json, decomposeSheet);

    await expectGolden('example/converter/from-json.json').toBe(rljson);
  });
});
