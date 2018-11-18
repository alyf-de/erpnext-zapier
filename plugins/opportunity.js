/*
This file enables a nicer autocompletion for the DocType "Lead".
It is used as a plugin in schema/document.js

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

const Plugin = require('./plugin');

const doctypes = [
  {
    // 0
    name: 'User',
    label: 'full_name',
  },
  {
    // 1
    name: 'Lead Source',
    label: 'source_name',
  },
  {
    // 2
    name: 'Opportunity Type',
    label: 'description',
  },
  {
    // 3
    name: 'Territory',
    label: 'territory_name',
  },
  {
    // 4
    name: 'Address',
    label: 'address_title',
  },
  {
    // 5
    name: 'Company',
    label: 'company_name',
  },
  {
    // 6
    name: 'Customer Group',
    label: 'customer_group_name',
  },
  {
    // 7
    name: 'Contact',
    label: 'name',
  },
  {
    // 8
    name: 'Lead',
    label: 'lead_name',
  },
  {
    // 9
    name: 'Customer',
    label: 'customer_name',
  },
  {
    // 10
    name: 'Item',
    label: 'item_name',
  },
  {
    // 11
    name: 'Campaign',
    label: 'campaign_name',
  },
];

const staticFields = [
  {
    key: 'naming_series',
    label: 'Naming Series',
    default: 'OPTY-',
  },
  {
    key: 'enquiry_from',
    label: 'Opportunity From',
    required: true,
    altersDynamicFields: true,
    choices: ['Lead', 'Customer'],
  },
  {
    key: 'status',
    label: 'Status',
    required: true,
    choices: ['Open', 'Quotation', 'Converted', 'Lost', 'Replied', 'Closed'],
  },
  {
    key: 'transaction_date',
    label: 'Opportunity Date',
    type: 'datetime',
    helpText: 'Date in format YYYY-MM-DD',
  },
  {
    key: 'contact_date',
    label: 'Next Contact Date',
    type: 'datetime',
    helpText: 'Date in format YYYY-MM-DD',
  },
  {
    key: 'title',
    label: 'Title',
    type: 'string',
    helpText: 'Give this opportunity a title.',
  },
  {
    key: 'with_items',
    label: 'With Items',
    type: 'number',
    altersDynamicFields: true,
  },
  {
    key: 'to_discuss',
    label: 'To Discuss',
    type: 'string',
    helpText: 'A short text',
  },
];

module.exports = class Opportunity extends Plugin {
  constructor(z, bundle) {
    super(z, bundle.inputData);
    this._doctypes = doctypes;
    this._fields = staticFields;
  }

  get fields() {
    return this._fields;
  }

  set fields(choices) {
    this._fields.push(
      {
        key: 'contact_by',
        label: 'Next Contact By',
        helpText: 'User (ID) that should contact the lead',
        choices: choices[0],
      },
      {
        key: 'source',
        label: 'Source',
        altersDynamicFields: true,
        choices: choices[1],
        helpText: 'Link to existing Lead Source (ID)',
      },
      {
        key: 'opportunity_type',
        label: 'Opportunity Type',
        required: true,
        choices: choices[2],
      },
      {
        key: 'territory',
        label: 'Territory',
        choices: choices[3],
      },
      {
        key: 'customer_address',
        label: 'Customer / Lead Address',
        choices: choices[4],
      },
      {
        key: 'company',
        label: 'Company',
        choices: choices[5],
        helpText: 'Link to Company (ID)',
      },
      {
        key: 'customer_group',
        label: 'Customer Group',
        choices: choices[6],
      },
      {
        key: 'contact_person',
        label: 'Contact Person',
        choices: choices[7],
      }
    );

    if (this._input.enquiry_from === 'Lead') {
      this._fields.push({
        key: 'lead',
        label: 'Lead',
        required: true,
        choices: choices[8],
        helpText: 'Link to existing Lead (ID)',
      });
    }

    if (this._input.enquiry_from === 'Customer') {
      this._fields.push({
        key: 'customer',
        label: 'Customer',
        required: true,
        choices: choices[9],
        helpText: 'Link to existing Customer (ID)',
      });
    }

    if (this._input.with_items > 0) {
      this._fields.push({
        key: 'items',
        label: 'Opportunity Item',
        // zapier doesn't allow this to be a list
        children: [
          {
            key: 'item_code',
            label: 'Item',
            required: true,
            type: 'string',
            choices: choices[10],
          },
          {
            key: 'qty',
            label: 'Quantity',
            type: 'number',
          },
          {
            key: 'item_name',
            label: 'Item Name',
            type: 'string',
          },
        ],
      });
    }

    if (this._input.source === 'Campaign') {
      this._fields.push({
        key: 'campaign',
        label: 'Campaign',
        choices: choices[11],
        helpText: 'Enter name of campaign if source of enquiry is campaign',
      });
    }
  }
};
