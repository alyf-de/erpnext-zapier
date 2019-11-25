/*
"DocType" resource to power dynamic fields. Lists all available DocTypes.

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
const { addId } = require('../util');

module.exports = {
  key: 'doctype',
  noun: 'DocType',

  list: {
    display: {
      hidden: true,
      label: 'List DocTypes',
      description: `Get a list of DocTypes.`,
    },
    operation: {
      perform: z =>
        listDocuments(z, 'DocType', {
          limitPageLength: 600,
        }).then(response => {
          return response.map(doc => addId(doc));
        }),
      sample: {
        id: 'ToDo',
      },
    },
  },
};
