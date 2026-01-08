// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { TimeId } from '../tools/time-id.ts';
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
export type TreeWithHash = Tree & { _hash: string };

// .............................................................................
/**
 * A TreeRoot represents the time related root of a tree structure
 */
export interface TreeRoot extends Json {
  timeId: TimeId;
  root: TreeRef;
}

export type TreeRootWithHash = TreeRoot & { _hash: string };

// .............................................................................
/**
 * A table containing trees
 */
export type TreesTable = RljsonTable<Tree, 'trees'>;

// .............................................................................
/**
 * A table containing tree roots
 */
export type TreeRootsTable = RljsonTable<TreeRoot, 'treeRoots'>;

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

// .............................................................................
export const createTreeRootsTableCfg = (
  treeRootsTableKey: string,
  treeTableKey: string,
): TableCfg => ({
  key: treeRootsTableKey,
  type: 'treeRoots',
  columns: [
    { key: '_hash', type: 'string', titleLong: 'Hash', titleShort: 'Hash' },
    {
      key: 'timeId',
      type: 'string',
      titleLong: 'Time Identifier',
      titleShort: 'Time ID',
    },
    {
      key: 'root',
      type: 'string',
      titleLong: 'Root Tree Reference',
      titleShort: 'Root Ref',
      ref: {
        type: 'trees',
        tableKey: treeTableKey,
      },
    },
  ],
  isHead: false,
  isRoot: false,
  isShared: true,
});

/**
 * Provides an example treesTable for test purposes
 */
export const exampleTreesTable = (): TreesTable =>
  bakeryExample().recipesTreeTable;

/**
 * Provides an example treeRootsTable for test purposes
 */
export const exampleTreeRootsTable = (): TreeRootsTable =>
  bakeryExample().recipesTreeRootsTable;

/**
 * Converts a plain object into a tree structure
 * @param obj - The plain object to convert
 * @returns An array of Tree nodes representing the tree structure
 */
export const treeFromObject = (obj: any): TreeWithHash[] => {
  const result: TreeWithHash[] = [];
  const processedIds = new Set<string>();
  const idToHashMap = new Map<string, string>();

  const processNode = (value: any, nodeId: string): void => {
    /* v8 ignore next -- @preserve */
    if (processedIds.has(nodeId)) {
      return;
    }
    processedIds.add(nodeId);

    const childIds: string[] = [];

    // Check if value is an array
    if (Array.isArray(value)) {
      for (const item of value) {
        /* v8 ignore else -- @preserve */
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          // Extract the ID from the single-key object
          const keys = Object.keys(item);

          /* v8 ignore else -- @preserve */
          if (keys.length === 1) {
            const childId = keys[0];
            childIds.push(childId);
            processNode(item[childId], childId);
          }
        }
      }

      /* v8 ignore next -- @preserve */
      const treeNode: Tree = {
        id: nodeId,
        isParent: true,
        meta: null,
        children:
          childIds.length > 0
            ? (childIds.map((id) => idToHashMap.get(id)!) as TreeRef[])
            : null,
      };
      const hashedNode = hip<Tree>(treeNode) as TreeWithHash;
      idToHashMap.set(nodeId, hashedNode._hash as string);
      result.push(hashedNode);
    }
    // Check if value is a plain object (not array, not null)
    else if (value !== null && typeof value === 'object') {
      for (const key in value) {
        /* v8 ignore else -- @preserve */
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          childIds.push(key);
          processNode(value[key], key);
        }
      }

      /* v8 ignore next -- @preserve */
      const treeNode: Tree = {
        id: nodeId,
        isParent: true,
        meta: null,
        children:
          childIds.length > 0
            ? (childIds.map((id) => idToHashMap.get(id)!) as TreeRef[])
            : null,
      };
      const hashedNode = hip<Tree>(treeNode) as TreeWithHash;
      idToHashMap.set(nodeId, hashedNode._hash as string);
      result.push(hashedNode);
    }
    // Leaf node (primitive value)
    else {
      const treeNode: Tree = {
        id: nodeId,
        isParent: false,
        meta: { value },
        children: null,
      };
      const hashedNode = hip<Tree>(treeNode) as TreeWithHash;
      idToHashMap.set(nodeId, hashedNode._hash as string);
      result.push(hashedNode);
    }
  };

  // Start processing from root
  /* v8 ignore else -- @preserve */
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key in obj) {
      /* v8 ignore else -- @preserve */
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        processNode(obj[key], key);
      }
    }
  }

  return result;
};
