/*
Generic document resource to manipulate any of ERPNext's DocTypes.

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

const { addId, listToObject, removeItem, uniqueItems } = require('../util');
const {
  getDocument,
  deleteDocument,
  postDocument,
  listDocuments,
} = require('../api');

const typemap = {
  Data: 'string',
  Datetime: 'datetime',
  Date: 'string', // for example, 2019-02-28
  'Small Text': 'text',
  'Text Editor': 'text',
  'Long Text': 'text',
  Text: 'text',
  Currency: 'number',
  Float: 'number',
  Int: 'integer',
  Check: 'integer',
  Password: 'password',
};

module.exports = {
  key: 'document',
  noun: 'Document',
  /******************************************************
   *                        GET                         *
   ******************************************************/
  get: {
    display: {
      label: `Get Document`,
      description: `Gets a Document.`,
    },
    operation: {
      inputFields: [
        {
          key: 'doctype',
          label: 'DocType',
          dynamic: 'doctype.id',
          helpText: 'Type of the Document you would like to manipulate',
          altersDynamicFields: true,
          required: true,
        },
        {
          key: 'name',
          label: 'Name (ID)',
          required: true,
        },
      ],
      perform: (z, bundle) =>
        getDocument(z, bundle.inputData.doctype, bundle.inputData.name).then(
          response => addId(response)
        ),
    },
  },
  /******************************************************
   *                        LIST                        *
   ******************************************************/
  list: {
    display: {
      label: `List Documents`,
      description: `Get a list of Documents.`,
    },
    operation: {
      inputFields: [
        {
          key: 'doctype',
          label: 'DocType',
          helpText: 'Type of the Document you would like to manipulate',
          dynamic: 'doctype.id',
          required: true,
        },
      ],
      perform: (z, bundle) =>
        listDocuments(z, bundle.inputData.doctype, {
          fields: '"*"',
          limitPageLength: 100,
          limitStart: 100 * bundle.meta.page,
        }).then(response => {
          return response.map(doc => addId(doc));
        }),
    },
  },
  /******************************************************
   *                       TRIGGER                      *
   ******************************************************/
  hook: {
    display: {
      label: `New Document`,
      description: `Triggers when a new Document is created.`,
    },
    operation: {
      type: 'hook',

      // `inputFields` can define the fields a user could provide,
      // we'll pass them in as `bundle.inputData` later.
      inputFields: [
        {
          key: 'doctype',
          label: 'DocType',
          dynamic: 'doctype.id',
          helpText: 'Type of the Document you would like to manipulate',
          altersDynamicFields: true,
          required: true,
        },
        {
          key: 'triggerEvent',
          required: true,
          label: 'Trigger Event',
          helpText: 'Which event this should trigger on.',
          default: 'after_insert',
          choices: {
            after_insert: 'After insert',
            on_update: 'On update',
            on_submit: 'On submit',
            on_cancel: 'On cancel',
            on_trash: 'On trash',
            on_update_after_submit: 'On update after submit',
            on_change: 'On change',
          },
        },
        (z, bundle) =>
          getDocument(z, 'DocType', bundle.inputData.doctype)
            .then(result =>
              result.fields
                .filter(field => field.fieldtype !== 'Section Break')
                .filter(field => field.fieldtype !== 'Column Break')
                .map(field => {
                  return {
                    key: field.fieldname,
                    label: field.label,
                  };
                })
            )
            .then(choices => listToObject(choices))
            .then(choices => {
              return {
                key: 'webhookData',
                list: true,
                helpText: 'The properties you care about, for example "phone".',
                choices: choices,
              };
            }),
      ],

      performSubscribe: (z, bundle) => {
        // return sanitized webhook parameters from bundle
        let webhookData = [];
        // webhookData is not required; we have to check if it exists
        if (bundle.inputData.hasOwnProperty('webhookData')) {
          // 'name' will already be used as ID
          webhookData = removeItem(bundle.inputData.webhookData, 'name');
          // remove duplicates as they would cause a HTTP 417 Error
          webhookData = uniqueItems(webhookData);
        }

        webhookData = webhookData.map(x => {
          return { fieldname: x, key: x };
        });

        return postDocument(z, 'Webhook', {
          // bundle.targetUrl has the Hook URL this app should call when a document is created.
          request_url: bundle.targetUrl,
          webhook_doctype: bundle.inputData.doctype,
          webhook_docevent: bundle.inputData.triggerEvent,
          // zapier requires the id field
          webhook_data: [{ fieldname: 'name', key: 'id' }, ...webhookData],
        }).then(response => addId(response));
      },

      performUnsubscribe: (z, bundle) =>
        deleteDocument(z, 'Webhook', bundle.subscribeData.name),

      // bundle.cleanedRequest will include the parsed JSON object (if it's not a
      // test poll) and also a .querystring property with the URL's query string.
      // Results must be an array
      perform: (z, bundle) => [addId(bundle.cleanedRequest)],

      // should return an object with the same structure as would be received from the webhook:
      //  {"lead_name": "Mustermann", ...} */
      performList: (z, bundle) =>
        listDocuments(z, bundle.inputData.doctype, {
          // stringify fields so the param will not be duplicated for every field
          fields: bundle.inputData.webhookData || [],
          limitStart: 100 * bundle.meta.page,
          limitPageLength: 100,
          // Results must be an array
        }).then(response => response.map(doc => addId(doc))),

      // If the resource can have fields that are custom on a per-user basis, define a function to fetch the custom
      // field definitions. The result will be used to augment the sample.
      // outputFields depends on which data the user requests in the inputField "webhookData"
      outputFields: [
        { key: 'id', label: 'Zapier ID', required: true },
        // generate one output field for every element of inputData.webhookData
        (z, bundle) =>
          bundle.inputData.webhookData.map(fieldname => {
            return { key: fieldname };
          }),
      ],
    },
  },
  /******************************************************
   *                       SEARCH                       *
   ******************************************************/
  search: {
    /*
        TO FIX: 404: The requested resource was not found: https://erp.alyf.de/api/resource/Lead/undefined
      */
    display: {
      label: `Find Document`,
      description: `Finds a Document by searching.`,
    },
    operation: {
      inputFields: [
        {
          key: 'doctype',
          label: 'DocType',
          helpText: 'Type of the document you search for',
          dynamic: 'doctype.id',
          required: true,
          altersDynamicFields: true,
        },
        {
          key: 'limit_page_length',
          label: 'Limit Page Length',
          helpText: 'Limit the number of results.',
          type: 'number',
          default: '20',
        },
        (z, bundle) =>
          getDocument(z, 'DocType', bundle.inputData.doctype)
            .then(result =>
              result.fields
                .filter(field => field.fieldtype !== 'Section Break')
                .filter(field => field.fieldtype !== 'Column Break')
                .map(field => {
                  return {
                    key: field.fieldname,
                    label: field.label,
                  };
                })
            )
            .then(choices => listToObject(choices))
            .then(choices => {
              return [
                {
                  key: 'fields',
                  list: true,
                  helpText:
                    'The properties you want to receive in the response',
                  choices: choices,
                  type: 'string',
                  default: 'name',
                },
                {
                  key: 'filter',
                  children: [
                    {
                      key: 'filter_property',
                      type: 'string',
                      helpText: 'The property this filter wil be applied to.',
                      choices: choices,
                      default: 'name',
                    },
                    {
                      key: 'filter_operator',
                      type: 'string',
                      default: '=',
                      choices: [
                        '=',
                        '<',
                        '>',
                        '!=',
                        '<=',
                        '>=',
                        'like',
                        'not like',
                        'in',
                        'not in',
                        'between',
                      ],
                    },
                    {
                      key: 'filter_value',
                    },
                  ],
                },
              ];
            }),
      ],
      perform: (z, bundle) => {
        return listDocuments(z, bundle.inputData.doctype, {
          fields: bundle.inputData.fields,
          filters: [
            [
              // array inside array because you could apply multiple filters
              bundle.inputData.doctype,
              bundle.inputData.filter_property,
              bundle.inputData.filter_operator,
              bundle.inputData.filter_value,
            ],
          ],
          limitPageLength: bundle.inputData.limit_page_length,
        }).then(response => response.map(doc => addId(doc)));
      },
    },
  },
  /******************************************************
   *                       CREATE                       *
   ******************************************************/
  create: {
    display: {
      label: `Create Document`,
      description: `Creates a new Document.`,
    },
    operation: {
      // Data users will be asked to set in the Zap Editor
      inputFields: [
        {
          key: 'doctype',
          label: 'DocType',
          type: 'string',
          helpText: 'Type of document you would like to manipulate',
          dynamic: 'doctype.id',
          required: true,
          altersDynamicFields: true,
        },
        function(z, bundle) {
          if (bundle.inputData.doctype === 'Lead') {
            // Load fields with dynamic choices from Lead plugin
            let Lead = require('../plugins/lead');
            return new Lead(z, bundle).fetchFields();
          }
          if (bundle.inputData.doctype === 'Opportunity') {
            // Load fields with dynamic choices from Opportunity plugin
            let Opportunity = require('../plugins/opportunity');
            return new Opportunity(z, bundle).fetchFields();
          }
          // Load fields with only static choices for any DocType
          return getDocument(z, 'DocType', bundle.inputData.doctype).then(
            result =>
              result.fields
                .filter(field => field.fieldtype !== 'Section Break')
                .filter(field => field.fieldtype !== 'Column Break')
                .map(field => {
                  if (field.fieldtype === 'Link') {
                    // TODO: Query names of Link fields, maybe something like this:
                    // return listDocuments(z, field.options, {}).then(docs => {
                    //   return {
                    //     key: field.fieldname,
                    //     label: field.label,
                    //     choices: docs.map(doc => doc.name),
                    //   };
                    // });
                  }
                  if (field.fieldtype === 'Select') {
                    return {
                      key: field.fieldname,
                      label: field.label,
                      choices: field.options.split('\n'),
                    };
                  }
                  if (typemap.hasOwnProperty(field.fieldtype)) {
                    return {
                      key: field.fieldname,
                      label: field.label,
                      type: typemap[field.fieldtype],
                    };
                  }
                  return {
                    key: field.fieldname,
                    label: field.label,
                  };
                })
          );
        },
      ],
      perform: (z, bundle) =>
        postDocument(z, bundle.inputData.doctype, bundle.inputData).then(
          response => addId(response)
        ),
    },
  },
};
