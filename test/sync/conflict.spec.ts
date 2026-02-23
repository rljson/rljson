// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Conflict, ConflictCallback, ConflictType } from '../../src/index.ts';

describe('Conflict', () => {
  describe('ConflictType', () => {
    it('allows "dagBranch" as a valid conflict type', () => {
      const t: ConflictType = 'dagBranch';
      expect(t).toBe('dagBranch');
    });
  });

  describe('Conflict interface', () => {
    it('can be constructed with all required fields', () => {
      const conflict: Conflict = {
        table: 'sharedTree',
        type: 'dagBranch',
        detectedAt: Date.now(),
        branches: ['timeId_1', 'timeId_2'],
      };

      expect(conflict.table).toBe('sharedTree');
      expect(conflict.type).toBe('dagBranch');
      expect(typeof conflict.detectedAt).toBe('number');
      expect(conflict.branches).toHaveLength(2);
      expect(conflict.branches).toContain('timeId_1');
      expect(conflict.branches).toContain('timeId_2');
    });

    it('branches always contains at least two entries for dagBranch', () => {
      const conflict: Conflict = {
        table: 'testTable',
        type: 'dagBranch',
        detectedAt: 1700000000000,
        branches: ['branchA', 'branchB', 'branchC'],
      };

      expect(conflict.branches.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('ConflictCallback', () => {
    it('can be used as a callback type', () => {
      let received: Conflict | null = null;
      const callback: ConflictCallback = (conflict) => {
        received = conflict;
      };

      const conflict: Conflict = {
        table: 'filesTree',
        type: 'dagBranch',
        detectedAt: Date.now(),
        branches: ['tip1', 'tip2'],
      };

      callback(conflict);
      expect(received).toEqual(conflict);
    });
  });
});
