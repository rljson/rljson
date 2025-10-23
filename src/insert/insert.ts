// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.
import { Json } from '@rljson/json';

import { RouteRef } from '../route/route.ts';
import { Ref } from '../typedefs.ts';


//Insert
// .............................................................................

/**
 * An Insert Object describing inserts on data basically
 */
export type InsertRef = Ref;

export type InsertCommand = 'add' | 'remove';

// .............................................................................
/**
 * An Insert describes a change to be applied to an Rljson object.
 * @param T - The type of the value being edited, extending Json
 */
export type Insert<T extends Json> = {
  command: InsertCommand;
  value: T;
  route: RouteRef;
  origin?: Ref;
  acknowledged?: boolean;
};

export const exampleInsert = (): Insert<Json> => ({
  route: 'a/b/c',
  command: 'add',
  value: { x: { y: { z: true } } },
});
