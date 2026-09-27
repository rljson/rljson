// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { ComponentsTable } from '../../src/content/components';
import { ref, rowOf } from '../../src/tools/ref';
import { Row } from '../../src/typedefs';

describe('ref(row)', () => {
  it('returns the hash that hip has written into the row', () => {
    const row = hip<Row>({ id: 'flour' });

    expect(ref(row)).toBe(row._hash);
  });

  it('returns the references to the rows of a table', () => {
    const ingredients = hip<ComponentsTable<{ id: string }>>({
      _type: 'components',
      _data: [{ id: 'flour' }, { id: 'sugar' }, { id: 'flour' }],
    });
    const [flour, sugar, flourAgain] = ingredients._data;

    expect(ref(flour)).not.toBe(ref(sugar));
    expect(ref(flour)).toBe(ref(flourAgain)); // equal content, equal reference
    expect(ref(ingredients)).toBe(ingredients._hash); // tables are hashed too
  });

  it('throws when the row has not been hashed', () => {
    expect(() => ref({ id: 'flour' })).toThrow(
      'ref: The row has no _hash. Hash it with hip first.',
    );
  });
});

describe('rowOf(table, hash)', () => {
  const ingredients = hip<ComponentsTable<{ id: string }>>({
    _type: 'components',
    _data: [{ id: 'flour' }, { id: 'sugar' }],
  });
  const [flour, sugar] = ingredients._data;

  it('returns the row with the given hash', () => {
    expect(rowOf(ingredients, ref(flour))).toBe(flour);
    expect(rowOf(ingredients, ref(sugar))).toBe(sugar);
  });

  it('skips rows that have not been hashed', () => {
    const table: ComponentsTable<{ id: string }> = {
      _type: 'components',
      _data: [{ id: 'salt' }, sugar],
    };

    expect(rowOf(table, ref(sugar))).toBe(sugar);
  });

  it('throws when the table has no row with the given hash', () => {
    expect(() => rowOf(ingredients, 'MISSING')).toThrow(
      'rowOf: The table has no row with hash "MISSING".',
    );
  });
});
