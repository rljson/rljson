// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { ColumnCfg, TableCfg } from '../content/table-cfg.ts';
import { RljsonTable } from '../rljson.ts';

export interface EditHistory extends Json {
  timeId: string;
  multiEditRef: string;
  dataRef: string;
  previous: string[];
  _hash: string;
}

export type EditHistoryTable = RljsonTable<EditHistory, 'editHistory'>;

export const createEditHistoryTableCfg = (cakeKey: string): TableCfg =>
  ({
    key: `${cakeKey}EditHistory`,
    type: 'editHistory',
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
        key: 'multiEditRef',
        type: 'string',
        titleLong: 'Multi Edit Reference',
        titleShort: 'Multi Edit Ref',
        ref: {
          tableKey: `${cakeKey}MultiEdits`,
        },
      },
      {
        key: 'dataRef',
        type: 'string',
        titleLong: 'Data Reference',
        titleShort: 'Data Ref',
        ref: {
          tableKey: cakeKey,
        },
      },
      {
        key: 'previous',
        type: 'jsonArray',
        titleLong: 'Previous Values',
        titleShort: 'Previous',
      },
    ] as ColumnCfg[],
    isHead: false,
    isRoot: false,
    isShared: true,
  } as TableCfg);
