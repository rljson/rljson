// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { nanoid } from 'nanoid';

// .............................................................................
/**
 * A stable client identity that persists across reconnections.
 *
 * Unlike a Connector's ephemeral `origin` (which changes on every
 * instantiation), a `ClientId` should be generated once and stored
 * (e.g. in local storage) so that it can be reused across sessions.
 */
export type ClientId = string;

// .............................................................................
/**
 * Generates a new ClientId.
 * A ClientId is a 12-character nanoid, prefixed with `"client_"` for
 * easy visual identification in logs and debugging.
 * @returns A new ClientId string (e.g. `"client_V1StGXR8_Z5j"`)
 */
export const clientId = (): ClientId => {
  return 'client_' + nanoid(12);
};

// .............................................................................
/**
 * Checks whether a given string is a valid ClientId.
 * A valid ClientId starts with `"client_"` followed by exactly 12
 * characters.
 * @param id - The string to check
 * @returns `true` if the string matches the ClientId format
 */
export const isClientId = (id: string): boolean => {
  if (!id.startsWith('client_')) return false;
  const suffix = id.slice('client_'.length);
  return suffix.length === 12;
};

// .............................................................................
/**
 * Returns an example ClientId for documentation and testing.
 */
export const clientIdExample = (): ClientId => 'client_ExAmPlE12345';
