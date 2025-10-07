import { Json } from '@rljson/json';

import { objectDepth } from '../tools/object-depth.ts';
import { Errors } from '../validate/validate.ts';

import { Edit } from './edit.ts';
import { Route } from './route.ts';

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
    if (
      (typeof this._edit.previous !== 'undefined' &&
        !Array.isArray(this._edit.previous)) ||
      (Array.isArray(this._edit.previous) &&
        !this._edit.previous.every((p) => typeof p === 'string'))
    ) {
      this.errors.parameterPreviousInvalid = {
        error: 'Edit previous must be an array of strings if defined.',
        parameter: this._edit.previous,
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

    //Check if route matches value
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

    this.errors.hasErrors = this.hasErrors;
    return this.errors;
  }

  static create(edit: Edit<any>): EditValidator<any> {
    return new EditValidator(edit);
  }
}

export const validateEdit = (edit: Edit<any>): EditErrors => {
  return EditValidator.create(edit).validate();
};
