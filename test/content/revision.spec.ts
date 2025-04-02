// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { exampleRevision } from '../../src/content/revision';

describe('Revision', () => {
  it('exampleRevision', () => {
    expect(exampleRevision()).toEqual({
      table: 'nutritionalValues',
      id: 'flour',
      predecessor: 'gZXFSlrl5QAs5hOVsq5sWB',
      successor: 'IqeoWJjZQNlr-NVk2QT15B',
      timestamp: 1743558427,
    });
  });
});
