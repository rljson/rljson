// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { rmhsh } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { createTreesTableCfg, exampleTreesTable, treeFromObject } from '../../src/content/tree.ts';

import { expectGolden } from '../setup/goldens.ts';


describe('TreesTable', () => {
  it('provides a simple tree w/ one root and one child', async () => {
    const tree = exampleTreesTable();
    await expectGolden('content/tree.json').toBe(tree);
  });
});
describe('createTreesTableCfg', () => {
  it('provides a sample Tree TableCfg', async () => {
    const tableCfg = createTreesTableCfg('example');
    await expectGolden('content/trees-table-cfg.json').toBe(tableCfg);
  });
});

describe('treeFromObject', () => {
  it('handles empty object', () => {
    const result = treeFromObject({});
    expect(result).toEqual([]);
  });

  it('handles single primitive value', () => {
    const result = treeFromObject({ id1: 'value' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id1');
    expect(result[0].isParent).toBe(false);
    expect(rmhsh(result[0].meta!)).toEqual({ value: 'value' });
    expect(result[0].children).toBeNull();
    expect(result[0]._hash).toBeDefined();
    expect(typeof result[0]._hash).toBe('string');
  });

  it('handles nested object with primitives', () => {
    const result = treeFromObject({
      parent: {
        child1: 'value1',
        child2: 'value2',
      },
    });
    expect(result).toHaveLength(3);

    const parent = result.find((n) => n.id === 'parent')!;
    const child1 = result.find((n) => n.id === 'child1')!;
    const child2 = result.find((n) => n.id === 'child2')!;

    expect(parent.isParent).toBe(true);
    expect(parent.meta).toBeNull();
    expect(parent.children).toHaveLength(2);
    expect(parent.children).toContain(child1._hash);
    expect(parent.children).toContain(child2._hash);

    expect(child1.isParent).toBe(false);
    expect(rmhsh(child1.meta!)).toEqual({ value: 'value1' });
    expect(child1.children).toBeNull();

    expect(child2.isParent).toBe(false);
    expect(rmhsh(child2.meta!)).toEqual({ value: 'value2' });
    expect(child2.children).toBeNull();
  });

  it('handles array with single-key objects', () => {
    const result = treeFromObject({
      id1: [{ subId0: 'value0' }, { subId1: 'value1' }],
    });
    expect(result).toHaveLength(3);

    const id1 = result.find((n) => n.id === 'id1')!;
    const subId0 = result.find((n) => n.id === 'subId0')!;
    const subId1 = result.find((n) => n.id === 'subId1')!;

    expect(id1.isParent).toBe(true);
    expect(id1.meta).toBeNull();
    expect(id1.children).toEqual([subId0._hash, subId1._hash]);

    expect(subId0.isParent).toBe(false);
    expect(rmhsh(subId0.meta!)).toEqual({ value: 'value0' });

    expect(subId1.isParent).toBe(false);
    expect(rmhsh(subId1.meta!)).toEqual({ value: 'value1' });
  });

  it('handles nested arrays with single-key objects', () => {
    const result = treeFromObject({
      id1: [{ subId0: 'value' }, { subId1: [{ subId1SubId0: 'nestedValue' }] }],
    });
    expect(result).toHaveLength(4);

    const id1 = result.find((n) => n.id === 'id1')!;
    const subId0 = result.find((n) => n.id === 'subId0')!;
    const subId1 = result.find((n) => n.id === 'subId1')!;
    const subId1SubId0 = result.find((n) => n.id === 'subId1SubId0')!;

    expect(id1.children).toEqual([subId0._hash, subId1._hash]);
    expect(subId1.children).toEqual([subId1SubId0._hash]);
    expect(rmhsh(subId1SubId0.meta!)).toEqual({ value: 'nestedValue' });
  });

  it('handles null values', () => {
    const result = treeFromObject({ id1: null });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id1');
    expect(result[0].isParent).toBe(false);
    expect(rmhsh(result[0].meta!)).toEqual({ value: null });
    expect(result[0].children).toBeNull();
    expect(result[0]._hash).toBeDefined();
  });

  it('handles number values', () => {
    const result = treeFromObject({ id1: 42 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id1');
    expect(rmhsh(result[0].meta!)).toEqual({ value: 42 });
    expect(result[0]._hash).toBeDefined();
  });

  it('handles boolean values', () => {
    const result = treeFromObject({ id1: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id1');
    expect(rmhsh(result[0].meta!)).toEqual({ value: true });
    expect(result[0]._hash).toBeDefined();
  });

  it('handles empty array', () => {
    const result = treeFromObject({ id1: [] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id1');
    expect(result[0].isParent).toBe(true);
    expect(result[0].meta).toBeNull();
    expect(result[0].children).toBeNull();
    expect(result[0]._hash).toBeDefined();
  });

  it('handles deeply nested structures', () => {
    const result = treeFromObject({
      level1: {
        level2: {
          level3: 'deepValue',
        },
      },
    });
    expect(result).toHaveLength(3);

    const level1 = result.find((n) => n.id === 'level1')!;
    const level2 = result.find((n) => n.id === 'level2')!;
    const level3 = result.find((n) => n.id === 'level3')!;

    expect(level1.children).toEqual([level2._hash]);
    expect(level2.children).toEqual([level3._hash]);
    expect(rmhsh(level3.meta!)).toEqual({ value: 'deepValue' });
  });

  it('handles complex mixed structure', () => {
    const result = treeFromObject({
      root: {
        branch1: 'leaf1',
        branch2: [{ nested1: 'leaf2' }, { nested2: { deep: 'leaf3' } }],
      },
    });
    expect(result).toHaveLength(6);

    const root = result.find((n) => n.id === 'root')!;
    const branch1 = result.find((n) => n.id === 'branch1')!;
    const branch2 = result.find((n) => n.id === 'branch2')!;
    const nested1 = result.find((n) => n.id === 'nested1')!;
    const nested2 = result.find((n) => n.id === 'nested2')!;
    const deep = result.find((n) => n.id === 'deep')!;

    expect(root.children).toEqual([branch1._hash, branch2._hash]);
    expect(rmhsh(branch1.meta!)).toEqual({ value: 'leaf1' });
    expect(branch2.children).toEqual([nested1._hash, nested2._hash]);
    expect(rmhsh(nested1.meta!)).toEqual({ value: 'leaf2' });
    expect(nested2.children).toEqual([deep._hash]);
    expect(rmhsh(deep.meta!)).toEqual({ value: 'leaf3' });
  });
});
