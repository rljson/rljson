// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be

import { nanoid } from 'nanoid';

// found in the LICENSE file in the root of this package.
export const timeId = (): string => {
  return nanoid(4) + ':' + Date.now();
};
