/*
Runs after each response is received, allowing us to make tweaks to the
response in a centralized spot.

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

const catch500s = (response, z) => {
  if (response.status === 500) {
    z.console.log(response.json);
    throw new Error(
      `500: ERPNext encountered an unexpected condition that prevented it from
       fulfilling the request.`
    );
  }
  if (response.status > 500) {
    throw new Error(
      `${response.status}: ERPNext is aware that it has erred or is incapable
       of performing the requested method.`
    );
  }
  return response;
};
const catch400s = (response, z, bundle) => {
  if (response.status === 417) {
    throw new Error(
      `417: The server did not understand your request.
      Message from ERPNext: ${response.json._server_messages}`
    );
  }
  if (response.status === 409) {
    throw new Error(
      `409: This document seems to exist already: 
       ${z.JSON.stringify(bundle.inputData)}`
    );
  }
  if (response.status === 404) {
    throw new Error(
      `404: The requested resource was not found: ${response.request.url}`
    );
  }
  if (response.status === 403) {
    z.console.log(
      '403: ERPNext understood the request but refuses to authorize it.'
    );
    /*
      OAuth token might be expired
      This will signal Zapier to refresh the credentials and then repeat the failed operation.
    */
    throw new z.errors.RefreshAuthError();
  }
  if (response.status === 401) {
    z.console.log('401: You do not have the force with you. Maybe try sudo.');
    /* This will signal Zapier to refresh the credentials and then repeat the failed operation. */
    throw new z.errors.RefreshAuthError();
  }
  if (response.status >= 400) {
    throw new Error(`${response.status}: Probably you did something wrong.`);
  }
  return response;
};
const mustBeJson = response => {
  if (!response.json) {
    throw new Error(
      `Expected a JSON response. Got ${response.headers['Content-Type']}.`
    );
  }
  return response;
};
const mustBe200 = response => {
  if (response.status >= 300) {
    throw new Error(
      `${response.status}: The request was not answered as expected: ${
        response.content
      }`
    );
  }
  return response;
};

module.exports = [mustBeJson, catch500s, catch400s, mustBe200];
