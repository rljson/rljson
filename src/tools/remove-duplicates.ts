// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { Rljson } from '../rljson.ts';

/// Removes duplicate rows from each table in the given Rljson object.
export const removeDuplicates = (rljson: Rljson) => {
  const result: Rljson = {};
  for (const key in rljson) {
    if (key.startsWith('_')) continue;
    const table = rljson[key] as any;
    const data = table._data as any[];
    const newData = Array.from(
      new Map(data.map((row) => [row._hash, row])).values(),
    );
    result[key] = { ...table, _data: newData };
  }
  return hip(result, { throwOnWrongHashes: false });
};
