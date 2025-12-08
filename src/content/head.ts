// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { RljsonTable } from '../rljson.ts';

import { ColumnCfg, TableCfg } from './table-cfg.ts';

export interface Head extends Json {
  timeId: string;
  cakeRef: string;
  _hash: string;
}

export type HeadsTable = RljsonTable<Head, 'head'>;

export const createHeadsTableCfg = (cakeKey: string): TableCfg =>
  ({
    key: `${cakeKey}Heads`,
    type: 'head',
    columns: [
      {
        key: '_hash',
        type: 'string',
        titleLong: 'Hash',
        titleShort: 'Hash',
      },
      {
        key: 'timeId',
        type: 'string',
        titleLong: 'Time Identifier',
        titleShort: 'Time ID',
      },
      {
        key: 'cakeRef',
        type: 'string',
        titleLong: 'Cake Reference',
        titleShort: 'Cake Ref',
        ref: {
          tableKey: `${cakeKey}`,
        },
      },
    ] as ColumnCfg[],
    isHead: false,
    isRoot: false,
    isShared: true,
  } as TableCfg);
