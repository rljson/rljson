// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { RljsonTable } from '../rljson.ts';
import { Ref } from '../typedefs.ts';

import { TableCfg } from './table-cfg.ts';


// .............................................................................
/**
 * A TreeRef is a hash pointing to another hash in the tree
 */
export type TreeRef = Ref;

// .............................................................................
/**
 * A Tree is a hierarchical structure of Trees
 */
export interface Tree extends Json {
  /**
   * `id` identifies the tree node, it has to be unique among sibling nodes
   */
  id?: string;

  /**
   * If `isParent` is true, this node is a parent node and can have children
   */
  isParent: boolean;

  /**
   * Optional meta information about this tree node
   */
  meta: Json | null;

  /**
   * The children of this tree node
   */
  children: Array<TreeRef> | null;
}

// .............................................................................
/**
 * A table containing trees
 */
export type TreesTable = RljsonTable<Tree, 'trees'>;

// .............................................................................
/**
 * Creates a TableCfg for Trees tables
 * @param treesTableKey - The table key of the trees table
 * @returns A TableCfg for Trees tables
 */
export const createTreesTableCfg = (treesTableKey: string): TableCfg => ({
  key: treesTableKey,
  type: 'trees',
  columns: [
    { key: '_hash', type: 'string', titleLong: 'Hash', titleShort: 'Hash' },
    { key: 'id', type: 'string', titleLong: 'Identifier', titleShort: 'Id' },
    {
      key: 'isParent',
      type: 'boolean',
      titleLong: 'Is Parent',
      titleShort: 'Is Parent',
    },
    {
      key: 'meta',
      type: 'json',
      titleLong: 'Meta Information',
      titleShort: 'Meta',
    },
    {
      key: 'children',
      type: 'jsonArray',
      titleLong: 'Children',
      titleShort: 'Children',
    },
  ],
  isHead: false,
  isRoot: false,
  isShared: true,
});

/**
 * Provides an example treesTable for test purposes
 */
//export const exampleTreesTable = (): TreesTable => bakeryExample().recipeLayers;
