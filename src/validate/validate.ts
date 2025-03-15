// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { Rljson } from '../rljson.ts';

// .............................................................................
export type Errors = Json;

export interface ValidationResult {
  [group: string]: Errors;
}

// .............................................................................
export interface Validator {
  name: string;
  validate(rljson: Rljson): Promise<Errors>;
}

// .............................................................................
export class Validate {
  addValidator(validator: Validator): void {
    this._validators.push(validator);
  }

  async run(rljson: Rljson): Promise<{ [group: string]: Errors }> {
    // Run all validators in parallel
    const result = await Promise.all(
      this._validators.map(async (validator) => {
        const errors = await validator.validate(rljson);
        const name = validator.name;
        return {
          [name]: errors,
        };
      }),
    );

    // Merge all errors into one object
    return result.reduce((acc, errors) => {
      let hasErrors = false;
      for (const key of Object.keys(errors)) {
        const e = Object.keys(errors[key]);
        if (e.length > 0) {
          hasErrors = true;
          break;
        }
      }

      if (hasErrors) {
        return { ...acc, ...errors };
      }
      return acc;
    }, {});
  }

  // ######################
  // Private
  // ######################

  private _validators: Validator[] = [];
}
