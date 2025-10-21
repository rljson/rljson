// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { TableCfg } from '../content/table-cfg.ts';
import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { RouteRef } from '../route/route.ts';
import { Ref } from '../typedefs.ts';


// History
// .............................................................................
export type HistoryTimeId = string;

export type HistoryRow<Str extends string> = {
  [key in Str as `${Uncapitalize<string & key>}Ref`]: string; //Keys that reference other objects in the history
} & {
  timeId: HistoryTimeId; //Unique row id in the history table
  route: RouteRef; //Route to the edited object
  origin?: Ref; //Custom origin of the insert or edit
  previous?: HistoryTimeId[]; //Merge --> multiple previous edits or inserts
};

export type History<Str extends string> = RljsonTable<
  HistoryRow<Str>,
  'history'
>;

// .................................................................................
/**
 * Creates a TableCfg for a History table for the given table configuration
 * @param tableCfg - The table configuration to create the History table for
 * @returns The TableCfg for the History table
 */
export const createHistoryTableCfg = (tableCfg: TableCfg): TableCfg => ({
  key: `${tableCfg.key}History`,
  type: 'history',
  columns: [
    { key: '_hash', type: 'string' },
    { key: 'timeId', type: 'string' },
    { key: `${tableCfg.key}Ref`, type: 'string' },
    { key: 'route', type: 'string' },
    { key: 'origin', type: 'string' },
    { key: 'previous', type: 'jsonArray' },
  ],
  isHead: false,
  isRoot: false,
  isShared: false,
});

/**
 * Provides an example history table for test purposes
 */
export const exampleHistoryTable = (): History<any> =>
  bakeryExample().ingredientsHistory;
