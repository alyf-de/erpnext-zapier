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
    name: 'Gender',
    label: 'gender',
  },
  {
    // 3
    name: 'Territory',
    label: 'territory_name',
  },
  {
    // 4
    name: 'Industry Type',
    label: 'industry',
  },
  {
    // 5
    name: 'Company',
    label: 'company_name',
  },
  {
    // 6
    name: 'Customer',
    label: 'customer_name',
  },
  {
    // 7
    name: 'Salutation',
    label: 'salutation',
  },
];

const staticFields = [
  {
    key: 'email_id',
    label: 'Email Address',
    helpText: "Lead's contact email address",
  },
  {
    key: 'organization_lead',
    label: 'Lead is an Organization',
    type: 'integer',
    default: 0,
    altersDynamicFields: true,
  },
  {
    key: 'naming_series',
    label: 'Series',
    default: 'LEAD-',
    helpText: "Prefix of the unique Lead-number. For example, 'LEAD-'",
  },
  {
    key: 'status',
    label: 'Status',
    choices: [
      'Lead',
      'Open',
      'Replied',
      'Opportunity',
      'Quotation',
      'Lost Quotation',
      'Interested',
      'Converted',
      'Do Not Contact',
    ],
  },
  {
    key: 'contact_date',
    label: 'Next Contact Date',
    type: 'datetime',
    helpText: 'Date in format YYYY-MM-DD',
  },
  {
    key: 'ends_on',
    label: 'Ends On',
    type: 'datetime',
    helpText: 'Date in format YYYY-MM-DD',
  },
  {
    key: 'website',
    label: 'Website',
  },
  {
    key: 'type',
    label: 'Lead Type',
    choices: ['Client', 'Channel Partner', 'Consultant'],
  },
  {
    key: 'market_segment',
    label: 'Market Segment',
    choices: ['Lower Income', 'Middle Income', 'Upper Income'],
  },
  {
    key: 'request_type',
    label: 'Request Type',
    choices: [
      'Product Enquiry',
      'Request for Information',
      'Suggestions',
      'Other',
    ],
  },
  {
    key: 'unsubscribed',
    label: 'Unsubscribed',
    type: 'integer',
    default: 0,
  },
  {
    key: 'blog_subscriber',
    label: 'Blog Subscriber',
    type: 'integer',
    default: 0,
  },
];

module.exports = class Lead extends Plugin {
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
        key: 'lead_owner',
        label: 'Lead Owner',
        choices: choices[0],
        helpText: 'User that owns the lead',
      },
      {
        key: 'contact_by',
        label: 'Next Contact By',
        choices: choices[0],
        helpText: 'User (ID) that should contact the lead?',
      },
      {
        key: 'source',
        label: 'Source',
        choices: choices[1],
        altersDynamicFields: true,
        helpText: 'Link to existing Lead Source (ID)',
      },
      {
        key: 'gender',
        label: 'Gender',
        helpText: "Lead's gender",
        choices: choices[2],
      },
      {
        key: 'territory',
        label: 'Territory',
        choices: choices[3],
        default: 'All Territories',
      },
      {
        key: 'industry',
        label: 'Industry',
        choices: choices[4],
      },
      {
        key: 'company',
        label: 'Company',
        choices: choices[5],
        helpText: 'Link to Company (ID)',
      }
    );

    if (this._input.source === 'Campaign') {
      this._fields.push({
        key: 'campaign_name',
        label: 'Campaign Name',
        helpText: 'Link to campaign, because source of lead is a campaign',
      });
    }

    if (this._input.source === 'Existing Customer') {
      this._fields.push({
        key: 'customer',
        label: 'Customer',
        choices: choices[6],
        helpText: 'Link to existing Customer (ID)',
      });
    }

    if (this._input.organization_lead !== 1) {
      // lead is an individual
      this._fields.push(
        {
          key: 'lead_name',
          label: 'Person Name',
          required: true,
          helpText: 'Name of the Lead',
        },
        {
          key: 'phone',
          label: 'Phone',
          helpText: "Lead's contact phone number.",
        },
        {
          key: 'salutation',
          label: 'Salutation',
          choices: choices[7],
        },
        {
          key: 'mobile_no',
          label: 'Mobile No.',
        },
        {
          key: 'fax',
          label: 'Fax No.',
        },
        {
          key: 'company_name',
          label: 'Organization Name',
          helpText: "Name of the lead's organization",
        }
      );
    } else {
      // lead is a company
      this._fields.push({
        key: 'company_name',
        label: 'Organization Name',
        required: true,
      });
    }
  }
};
