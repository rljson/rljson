// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonH, JsonValueH } from '@rljson/json';

import { ContentType, Ref } from '../typedefs.ts';

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
  type: ContentType;
  value: T & JsonValueH;
  route: RouteRef;
  origin?: Ref;
  previous?: EditRef;
  acknowledged?: boolean;
} & JsonH;

// Edit Protocol
// .............................................................................
export type EditProtocolRowIdRef = number;

export type EditProtocolRow<Str extends string> = {
  [key in Str as `${Uncapitalize<string & key>}Ref`]: string; //Keys that reference other objects in the protocol
} & {
  id: EditProtocolRowIdRef; //Unique row id in the protocol
  route: RouteRef; //Route to the edited object
  origin?: Ref; //Custom origin of the edit
  previous?: EditProtocolRowIdRef[]; //Merge --> multiple previous edits
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
