import { Json } from '@rljson/json';

import { Route } from '../route/route.ts';
import { objectDepth } from '../tools/object-depth.ts';
import { Errors } from '../validate/validate.ts';

import { Insert } from './insert.ts';

// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

export interface InsertErrors extends Errors {
  invalidObject?: Json;
  parameterInvalid?: Json;
  parameterRouteInvalid?: Json;
  parameterCommandInvalid?: Json;
  parameterValueInvalid?: Json;
  parameterOriginInvalid?: Json;
  parameterPreviousInvalid?: Json;
  routeInvalid?: Json;
  dataRouteMismatch?: Json;
}

export class InsertValidator<T extends Json> {
  errors: InsertErrors = { hasErrors: false };

  // ............................................................................
  /**
   * Indicates whether there are any errors
   * @returns boolean - True if there are errors, false otherwise
   */
  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 1;
  }

  constructor(private _insert: Insert<T>) {}

  // ............................................................................
  /**
   * Validates the Insert object
   * @returns InsertErrors - The errors found during validation
   */
  validate(): InsertErrors {
    // Validate Insert
    if (
      typeof this._insert.route !== 'string' ||
      this._insert.route.length === 0
    ) {
      this.errors.parameterRouteInvalid = {
        error: 'Insert route must be a non-empty string.',
        parameter: this._insert.route,
      };
    }
    if (
      !this._insert.command.startsWith('add') &&
      !this._insert.command.startsWith('remove')
    ) {
      this.errors.parameterCommandInvalid = {
        error: "Insert command must be starting with either 'add' or 'remove'.",
        parameter: this._insert.command,
      };
    }
    if (
      typeof this._insert.value === 'undefined' ||
      typeof this._insert.value !== 'object' ||
      this._insert.value === null
    ) {
      this.errors.parameterValueInvalid = {
        error: 'Insert value must be a non-null object.',
        parameter: this._insert.value,
      };
    }
    if (
      typeof this._insert.origin !== 'undefined' &&
      typeof this._insert.origin !== 'string'
    ) {
      this.errors.parameterOriginInvalid = {
        error: 'Insert origin must be a string if defined.',
        parameter: this._insert.origin,
      };
    }

    //Check Route
    const route = Route.fromFlat(this._insert.route);
    if (!route.isValid) {
      this.errors.routeInvalid = {
        error: 'Insert route is not valid.',
        route: this._insert.route,
      };
    }

    //Check if route depth matches value
    if (route.isValid) {
      const routeDepth = route.segments.length;
      const valueDepth = objectDepth(this._insert.value);
      if (routeDepth > valueDepth) {
        this.errors.dataRouteMismatch = {
          error:
            'Insert route depth does not match value depth. Route depth must be lower than the depth of the value object.',
          route: this._insert.route,
          routeDepth,
          valueDepth,
        };
      }
    }

    //Check if value componentRefs a matching route segment
    if (typeof this._insert.value === 'object' && this._insert.value !== null) {
      this._checkMatchingRefs(route, this._insert.value);
    }

    this.errors.hasErrors = this.hasErrors;
    return this.errors;
  }

  // ............................................................................
  /**
   * Recursively checks that all reference keys in the value match the route segments
   * @param route - The current route segment
   * @param value - The current value object
   */
  private _checkMatchingRefs(route: Route, value: Json): void {
    const next = route.next;
    const keys = Object.keys(value);
    for (const key of keys) {
      if (
        key.endsWith('Ref') &&
        value[key] !== null &&
        value[key] !== undefined &&
        typeof value[key] !== 'string'
      ) {
        //Key is a reference key but value is not a string
        //Resolve reference object
        const refObj = value[key] as Json;
        if (!next || next.tableKey !== key.slice(0, -3)) {
          this.errors.parameterInvalid = {
            error: `Insert value has a reference key "${key}" that does not match the next route segment.`,
            parameter: this._insert.value,
          };
          break;
        }

        if (route.deeper().next)
          this._checkMatchingRefs(route.deeper(), refObj);
      }
    }
  }

  // ............................................................................
  /**
   * Creates an InsertValidator for the given Insert object
   * @param insert - The Insert object to validate
   * @returns InsertValidator - The InsertValidator instance
   */
  static create(insert: Insert<any>): InsertValidator<any> {
    return new InsertValidator(insert);
  }
}

// ............................................................................
/**
 * Validates the given Insert object
 * @param insert - The Insert object to validate
 * @returns InsertErrors - The errors found during validation
 */
export const validateInsert = (insert: Insert<any>): InsertErrors => {
  return InsertValidator.create(insert).validate();
};
