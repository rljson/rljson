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

// InsertHistory
// .............................................................................
export type InsertHistoryTimeId = string;

export type InsertHistoryRow<Str extends string> = {
  [key in Str as `${Uncapitalize<string & key>}Ref`]: string; //Keys that reference other objects in the insertHistory
} & {
  timeId: InsertHistoryTimeId; //Unique row id in the insertHistory table
  route: RouteRef; //Route to the edited object
  origin?: Ref; //Custom origin of the insert or edit
  previous?: InsertHistoryTimeId[]; //Merge --> multiple previous edits or inserts
};

export type InsertHistoryTable<Str extends string> = RljsonTable<
  InsertHistoryRow<Str>,
  'insertHistory'
>;

// .................................................................................
/**
 * Creates a TableCfg for a InsertHistory table for the given table configuration
 * @param tableCfg - The table configuration to create the InsertHistory table for
 * @returns The TableCfg for the InsertHistory table
 */
export const createInsertHistoryTableCfg = (tableCfg: TableCfg): TableCfg => ({
  key: `${tableCfg.key}InsertHistory`,
  type: 'insertHistory',
  columns: [
    { key: '_hash', type: 'string', titleLong: 'Hash', titleShort: 'Hash' },
    {
      key: 'timeId',
      type: 'string',
      titleLong: 'Time ID',
      titleShort: 'Time ID',
    },
    {
      key: `${tableCfg.key}Ref`,
      type: 'string',
      titleLong: 'Reference',
      titleShort: 'Ref',
    },
    { key: 'route', type: 'string', titleLong: 'Route', titleShort: 'Route' },
    {
      key: 'origin',
      type: 'string',
      titleLong: 'Origin',
      titleShort: 'Origin',
    },
    {
      key: 'previous',
      type: 'jsonArray',
      titleLong: 'Previous',
      titleShort: 'Previous',
    },
  ],
  isHead: false,
  isRoot: false,
  isShared: false,
});

/**
 * Provides an example insertHistory table for test purposes
 */
export const exampleInsertHistoryTable = (): InsertHistoryTable<any> =>
  bakeryExample().ingredientsInsertHistory;
