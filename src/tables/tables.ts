// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { TableCfg } from '../content/table-cfg.ts';
import { Rljson, TableType } from '../rljson.ts';
import { ContentType, TableKey } from '../typedefs.ts';

// .............................................................................
/** Options for Tables.ls */
export interface TablesLsOptions {
  /** Return aligned lines `name type rowCount` instead of names */
  long?: boolean;
  /** Include insert history tables and tables starting with `_` */
  internal?: boolean;
}

// .............................................................................
/**
 * Read only view on the tables of an Rljson dump.
 *
 * By default insert history tables and tables whose key starts with `_`
 * are hidden. Pass `internal: true` to ls() to include them.
 */
export class Tables {
  /**
   * Creates a view on the tables of the Rljson
   * @param rljson - the Rljson dump to wrap
   */
  constructor(rljson: Rljson) {
    this._rljson = rljson;
  }

  private readonly _rljson: Rljson;

  // ...........................................................................
  /** The wrapped Rljson */
  get rljson(): Rljson {
    return this._rljson;
  }

  // ...........................................................................
  /**
   * The sorted table keys.
   * @param options - see TablesLsOptions
   * @returns table keys, or aligned lines `name type rowCount` with `long`
   */
  ls(options: TablesLsOptions = {}): string[] {
    const keys = this._keys(options.internal === true);
    if (!options.long) {
      return keys;
    }

    const nameWidth = Math.max(0, ...keys.map((k) => k.length));
    const typeWidth = Math.max(
      0,
      ...keys.map((k) => this.get(k)!._type.length),
    );

    return keys.map(
      (k) =>
        `${k.padEnd(nameWidth)} ${this.get(k)!._type.padEnd(typeWidth)} ` +
        `${this.rowCount(k)}`,
    );
  }

  // ...........................................................................
  /** The visible tables in ls() order */
  get all(): TableType[] {
    return this.ls().map((k) => this.get(k)!);
  }

  // ...........................................................................
  /** The number of visible tables */
  get count(): number {
    return this.ls().length;
  }

  // ...........................................................................
  /**
   * The table with the given key or undefined
   * @param key - the table key
   */
  get(key: TableKey): TableType | undefined {
    const table = this._rljson[key];
    return Tables._isTable(table) ? table : undefined;
  }

  // ...........................................................................
  /**
   * True if a table with the key exists, including internal tables
   * @param key - the table key
   */
  has(key: TableKey): boolean {
    return this.get(key) !== undefined;
  }

  // ...........................................................................
  /**
   * The sorted keys of all tables with the given type, including internal
   * @param type - the content type
   */
  ofType(type: ContentType): TableKey[] {
    return this._keys(true).filter((k) => this.get(k)!._type === type);
  }

  // ...........................................................................
  /**
   * The latest table config for the key, or undefined
   * @param key - the table key
   */
  cfg(key: TableKey): TableCfg | undefined {
    const cfgs = (this.get('tableCfgs')?._data ?? []) as TableCfg[];
    return cfgs.filter((c) => c.key === key).pop();
  }

  // ...........................................................................
  /**
   * The number of rows of the table, 0 if it does not exist
   * @param key - the table key
   */
  rowCount(key: TableKey): number {
    return this.get(key)?._data.length ?? 0;
  }

  // ######################
  // Private
  // ######################

  private _keys(internal: boolean): TableKey[] {
    return Object.keys(this._rljson)
      .filter((k) => this.has(k))
      .filter(
        (k) =>
          internal ||
          (!k.startsWith('_') && this.get(k)!._type !== 'insertHistory'),
      )
      .sort();
  }

  private static _isTable(value: unknown): value is TableType {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as any)._type === 'string' &&
      Array.isArray((value as any)._data)
    );
  }
}
