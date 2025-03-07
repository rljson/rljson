// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { exampleRljson } from './rljson.ts';

/**
 * The example function demonstrates how the package works
 */
export const example = () => {
  const print = console.log;
  const stringify = JSON.stringify;

  const rljson = exampleRljson();
  print(stringify(rljson, null, 2));
};
