// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { exampleCluster } from '../../src/content/cluster.ts';

import { expectGolden } from '../setup/goldens.ts';


describe('Cluster', () => {
  it('provides a cluster', async () => {
    await expectGolden('content/cluster.json').toBe(exampleCluster());
  });
});
