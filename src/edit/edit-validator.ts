import { Json } from '@rljson/json';

import { Route } from '../route/route.ts';
import { objectDepth } from '../tools/object-depth.ts';
import { Errors } from '../validate/validate.ts';

import { Edit } from './edit.ts';


// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

export interface EditErrors extends Errors {
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

export class EditValidator<T extends Json> {
  errors: EditErrors = { hasErrors: false };

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 1;
  }

  constructor(private _edit: Edit<T>) {}

  validate(): EditErrors {
    // Validate Edit
    if (typeof this._edit.route !== 'string' || this._edit.route.length === 0) {
      this.errors.parameterRouteInvalid = {
        error: 'Edit route must be a non-empty string.',
        parameter: this._edit.route,
      };
    }
    if (
      !this._edit.command.startsWith('add') &&
      !this._edit.command.startsWith('remove')
    ) {
      this.errors.parameterCommandInvalid = {
        error: "Edit command must be starting with either 'add' or 'remove'.",
        parameter: this._edit.command,
      };
    }
    if (
      typeof this._edit.value === 'undefined' ||
      typeof this._edit.value !== 'object' ||
      this._edit.value === null
    ) {
      this.errors.parameterValueInvalid = {
        error: 'Edit value must be a non-null object.',
        parameter: this._edit.value,
      };
    }
    if (
      typeof this._edit.origin !== 'undefined' &&
      typeof this._edit.origin !== 'string'
    ) {
      this.errors.parameterOriginInvalid = {
        error: 'Edit origin must be a string if defined.',
        parameter: this._edit.origin,
      };
    }

    //Check Route
    const route = Route.fromFlat(this._edit.route);
    if (!route.isValid) {
      this.errors.routeInvalid = {
        error: 'Edit route is not valid.',
        route: this._edit.route,
      };
    }

    //Check if route depth matches value
    if (route.isValid) {
      const routeDepth = route.segments.length;
      const valueDepth = objectDepth(this._edit.value);
      if (routeDepth !== valueDepth) {
        this.errors.dataRouteMismatch = {
          error:
            'Edit route depth does not match value depth. Route depth must match the depth of the value object.',
          route: this._edit.route,
          routeDepth,
          valueDepth,
        };
      }
    }

    //Check if value componentRefs a matching route segment
    if (typeof this._edit.value === 'object' && this._edit.value !== null) {
      this._checkMatchingRefs(route, this._edit.value);
    }

    this.errors.hasErrors = this.hasErrors;
    return this.errors;
  }

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
            error: `Edit value has a reference key "${key}" that does not match the next route segment.`,
            parameter: this._edit.value,
          };
          break;
        }

        if (route.deeper().next)
          this._checkMatchingRefs(route.deeper(), refObj);
      }
    }
  }

  static create(edit: Edit<any>): EditValidator<any> {
    return new EditValidator(edit);
  }
}

export const validateEdit = (edit: Edit<any>): EditErrors => {
  return EditValidator.create(edit).validate();
};
