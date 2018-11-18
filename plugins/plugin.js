/*
This file enables a nicer autocompletion for specific DocTypes.
It is used in plugins/{doctype}.js

Zapier App to automate ERPNext.
Copyright (C) 2018  Raffael Meyer

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
'use strict';

const { listDocuments } = require('../api');
const { listToObject } = require('../util');

module.exports = class Plugin {
  constructor(z, input) {
    this._input = input;
    this._z = z;
  }

  get doctypes() {
    return this._doctypes;
  }

  fetchFields() {
    return Promise.all(
      this.doctypes.map(doctype =>
        listDocuments(this._z, doctype.name, {
          fields: ['name', doctype.label],
          limit_page_length: 20,
        })
      )
    )
      .then(response =>
        response.map(records =>
          records.map(record => {
            /* --- hack to convert unknown property, for example 'territory_name' into label ---
              object is expected to have two keys, one is known to be 'name'
              1. extract the value of name,
              2. delete name and
              3. get the first of the remaining values, which should be the label
            */
            const key = record.name;
            delete record.name;
            const label = Object.values(record)[0];
            return { key: key, label: label };
          })
        )
      )
      .then(choicesLists => choicesLists.map(list => listToObject(list)))
      .then(choices => (this.fields = choices))
      .then(() => this.fields);
  }
};
