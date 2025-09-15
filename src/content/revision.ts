// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { RljsonTable } from '../rljson.ts';
import { Ref, TableKey } from '../typedefs.ts';

/**
 * Describes a revision of a row in a table
 */
export interface Revision extends Json {
  /**
   * The name of the table the revisione row belongs to
   */
  table: TableKey;

  /**
   * The predecessor of the revision
   */
  predecessor: Ref;

  /**
   * The successor of the revision
   */
  successor: Ref;

  /**
   * The UTC timestamp of the revision
   */
  timestamp: number;

  /**
   * The optional ID of the revisioned element.
   * Can be used get all revisions of a specific component.
   */
  id?: string;
}

/**
 * A table containing revisions
 */
export type RevisionsTable = RljsonTable<Revision, 'revisions'>;

/**
 * Example revision object for test purposes
 */
export const exampleRevision = (): Revision => ({
  table: 'nutritionalValues',
  id: 'flour',
  predecessor: 'gZXFSlrl5QAs5hOVsq5sWB',
  successor: 'IqeoWJjZQNlr-NVk2QT15B',
  timestamp: 1743558427,
});
