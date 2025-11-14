// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { TableCfg } from '../content/table-cfg.ts';
import { RljsonTable } from '../rljson.ts';

export interface EditAction extends Json {
  name: string;
  type: string;
  data: Json;
  _hash: string;
}

export interface Edit extends Json {
  name: string;
  action: EditAction;
  _hash: string;
}

export type EditsTable = RljsonTable<Edit, 'edits'>;

export const createEditTableCfg = (cakeKey: string): TableCfg =>
  ({
    key: `${cakeKey}Edits`,
    type: 'edits',
    columns: [
      {
        key: '_hash',
        type: 'string',
        titleLong: 'Hash',
        titleShort: 'Hash',
      },
      {
        key: 'name',
        type: 'string',
        titleLong: 'Name of the Edit',
        titleShort: 'Name',
      },
      {
        key: 'action',
        type: 'json',
        titleLong: 'Edit Action Data',
        titleShort: 'Action',
      },
    ] as TableCfg['columns'],
  } as TableCfg);
