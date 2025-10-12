// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { nanoid } from 'nanoid';


// .............................................................................
/**
 * Generates a new TimeId.
 * A TimeId is a string in the format "xxxx:timestamp" where:
 * - "xxxx" is a 4-character unique identifier
 * - "timestamp" is the current time in milliseconds since epoch
 * @returns A new TimeId string
 */
export const timeId = (): string => {
  return nanoid(4) + ':' + Date.now();
};

// .............................................................................
/**
 * Checks if a given id is a valid TimeId.
 * A valid TimeId has the format "xxxx:timestamp" where:
 * - "xxxx" is a 4-character string
 * - "timestamp" is a valid number representing milliseconds since epoch
 * @param id - The id to check
 * @returns True if the id is a valid TimeId, false otherwise
 */
export const isTimeId = (id: string): boolean => {
  const parts = id.split(':');
  if (parts.length !== 2) return false;
  if (isNaN(Number(parts[1]))) return false;
  return parts[0].length === 4;
};
