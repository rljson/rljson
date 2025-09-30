// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonH, JsonValueH } from '@rljson/json';

import { Ref } from '../typedefs.ts';

import { RouteRef } from './route.ts';
import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';

//Edit
// .............................................................................

/**
 * An Edit Object describing edits on data basically
 */
export type EditRef = Ref;

export type Edit<T extends Json> = {
  value: T & JsonValueH;
  route: RouteRef;
  origin?: Ref;
  previous?: EditProtocolTimeId[];
  acknowledged?: boolean;
} & JsonH;

// Edit Protocol
// .............................................................................
export type EditProtocolTimeId = string;

export type EditProtocolRow<Str extends string> = {
  [key in Str as `${Uncapitalize<string & key>}Ref`]: string; //Keys that reference other objects in the protocol
} & {
  timeId: EditProtocolTimeId; //Unique row id in the protocol
  route: RouteRef; //Route to the edited object
  origin?: Ref; //Custom origin of the edit
  previous?: EditProtocolTimeId[]; //Merge --> multiple previous edits
};

export type EditProtocol<Str extends string> = RljsonTable<
  EditProtocolRow<Str>,
  'edits'
>;

/**
 * Provides an example Edits table for test purposes
 */
export const exampleEditsTable = (): EditProtocol<any> =>
  bakeryExample().ingredientsEdits;
