// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { InsertHistoryTimeId } from '../insertHistory/insertHistory.ts';

// .............................................................................
/**
 * The type of conflict detected in the InsertHistory DAG.
 *
 * - `'dagBranch'` — Two or more InsertHistory rows share the same
 *   predecessor, creating divergent branches. This indicates concurrent
 *   writes from different clients that have not yet been merged.
 */
export type ConflictType = 'dagBranch';

// .............................................................................
/**
 * Represents a detected conflict in the InsertHistory DAG.
 *
 * A `Conflict` is emitted when the system detects that the InsertHistory
 * for a table has diverged into multiple branches (multiple "tips" that
 * are not ancestors of each other).
 * Detection only — no resolution: this type signals that a conflict
 * exists. Resolution logic is left to upper layers (application code).
 */
export interface Conflict {
  /** The table where the conflict was detected (without InsertHistory suffix). */
  table: string;

  /** The type of conflict. */
  type: ConflictType;

  /** Timestamp (ms since epoch) when the conflict was detected. */
  detectedAt: number;

  /**
   * The InsertHistory tip timeIds that form the branches.
   *
   * A "tip" is a timeId that is not referenced as `previous` by any other
   * InsertHistory row. Multiple tips indicate a DAG fork.
   *
   * Always contains at least two entries when `type === 'dagBranch'`.
   */
  branches: InsertHistoryTimeId[];
}

// .............................................................................
/**
 * Callback invoked when a conflict is detected.
 */
export type ConflictCallback = (conflict: Conflict) => void;
