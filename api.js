/*
Zapier App to automate ERPNext.
Copyright (C) 2018  Raffael Meyer
Copyright (c) 2019  Dokos SAS

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

const {
  METHOD_ENDPOINT,
  RESOURCE_ENDPOINT,
  OAUTH_AUTHORIZE_ENDPOINT,
} = require('./constants');

const { uniqueItems } = require('./util');

/**
 * get a specific document
 *
 * @param   {*}      z        Zapier object for requests with advanced logging
 * @param   {string} docType  ERPNext DocType
 * @param   {string} docName  Unique name (ID) of the document
 * @returns {object}          Document object
 */
const getDocument = (z, docType, docName) => {
  return z
    .request({
      method: 'GET',
      url:
        '{{bundle.authData.BASE_URL}}' +
        RESOURCE_ENDPOINT +
        `/${docType}/${docName}`,
    })
    .then(response => response.json.data);
};

/**
 * modify a specific document
 *
 * @param   {*}      z        Zapier object for requests with advanced logging
 * @param   {string} docType  ERPNext DocType
 * @param   {string} docName  Unique name (ID) of the document
 * @param   {object} docBody  Object with fieldnames and new values
 * @returns {object}          Document object
 */
const putDocument = (z, docType, docName, docBody) => {
  return z
    .request({
      method: 'PUT',
      url:
        '{{bundle.authData.BASE_URL}}' +
        RESOURCE_ENDPOINT +
        `/${docType}/${docName}`,
      body: docBody,
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json.data);
};

/**
 * delete a specific document
 *
 * @param   {*}      z        Zapier object for requests with advanced logging
 * @param   {string} docType  ERPNext DocType
 * @param   {string} docName  Unique name (ID) of the document
 * @returns {string}          Message (usually 'ok')
 */
const deleteDocument = (z, docType, docName) => {
  return z
    .request({
      url:
        '{{bundle.authData.BASE_URL}}' +
        RESOURCE_ENDPOINT +
        `/${docType}/${docName}`,
      method: 'DELETE',
    })
    .then(response => response.json.message);
};

/**
 * create a new document of given DocType
 *
 * @param   {*}      z        Zapier object for requests with advanced logging
 * @param   {string} docType  ERPNext DocType
 * @param   {object} docBody  Object with fieldnames and new values
 * @returns {object}          Document object
 */
const postDocument = (z, docType, docBody) => {
  return z
    .request({
      method: 'POST',
      url: '{{bundle.authData.BASE_URL}}' + RESOURCE_ENDPOINT + `/${docType}`,
      body: docBody,
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
      return response.json.data;
    })
    .catch(e => {
      z.console.log('CREATE ERROR', e);
    });
};

/**
 * Get a list of documents for a given DocType
 *
 * @param   {*}        z                        Zapier object for requests with advanced logging
 * @param   {string}   docType                  ERPNext DocType
 * @param   {object}   params                   Object with fieldnames and new values
 * @param   {number}   params.limitPageLength   Number of documents for paginiation
 * @param   {number}   params.limitStart        multiple of `limitPageLength` to get successive pages
 * @param   {Array}    params.fields            fields of the DocType that should be returned, defaults to 'name'
 * @param   {Array}    params.filters           list of SQL-filters in format
 *                                              [[DocType, DocName, fieldname, operator, value]]
 * @returns {Object[]}                          Array of document objects
 */
const listDocuments = (z, docType, params) => {
  if (params.hasOwnProperty('fields') && Array.isArray(params.fields)) {
    if (!params.fields.includes('name')) {
      params.fields.push('name');
    }
    params.fields = uniqueItems(params.fields);
  }
  return z
    .request({
      method: 'GET',
      url: '{{bundle.authData.BASE_URL}}' + RESOURCE_ENDPOINT + `/${docType}`,
      params: {
        // stringify fields so the param will not be duplicated for every field
        fields: JSON.stringify(params.fields) || '["name"]',
        filters: JSON.stringify(params.filters) || '[]',
        limit_page_length: params.limitPageLength || 20,
        limit_start: params.limitStart || 0,
      },
    })
    .then(response => {
      // Expected response: {"data": [{"lead_name": "Mustermann", ...}]}
      if (!response.json.hasOwnProperty('data')) {
        throw new Error('Search did not return any data: ' + response.json);
      }
      return response.json.data || [];
    });
};

/**
 * Send data to a whitelisted method
 *
 * @param   {*}      z                   Zapier object for requests with advanced logging
 * @param   {string} dottedPathToMethod  Dotted path to method, e.g. 'frappe.auth.get_logged_user'
 * @param   {object} postData            Object containing the data to post
 * @returns {object}                     Parsed json response
 */
const postMethod = (z, baseUrl, dottedPathToMethod, postData) => {
  return z
    .request({
      method: 'POST',
      url: baseUrl + METHOD_ENDPOINT + `/${dottedPathToMethod}`,
      body: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => response.json);
};

/**
 * Get data from a whitelisted method
 *
 * @param   {*}      z                   Zapier object for requests with advanced logging
 * @param   {string} dottedPathToMethod  Dotted path to method, e.g. 'frappe.auth.get_logged_user'
 * @param   {object} params              Object containing query parameters
 * @returns {object}                     Parsed json response
 */
const getMethod = (z, dottedPathToMethod, params) => {
  return z
    .request({
      method: 'GET',
      url:
        '{{bundle.authData.BASE_URL}}' +
        METHOD_ENDPOINT +
        `/${dottedPathToMethod}`,
      params: params || {},
    })
    .then(response => response.json);
};

const getAuthorizeRequest = () => {
  return {
    method: 'GET',
    url: '{{bundle.inputData.BASE_URL}}' + OAUTH_AUTHORIZE_ENDPOINT,
    params: {
      client_id: '{{bundle.inputData.CLIENT_ID}}',
      state: '{{bundle.inputData.state}}',
      response_type: 'code',
      scope: 'all',
      redirect_uri: '{{bundle.inputData.redirect_uri}}',
    },
  };
};

module.exports = {
  getDocument,
  putDocument,
  deleteDocument,
  postDocument,
  listDocuments,
  getMethod,
  postMethod,
  getAuthorizeRequest,
};
