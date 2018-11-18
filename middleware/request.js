/*
Runs before each request is sent out, allowing us to make tweaks to the
request in a centralized spot.

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

// Include the Authorization header on all outbound requests
const includeBearerToken = (request, z, bundle) => {
  if (
    bundle.hasOwnProperty('authData') &&
    bundle.authData.hasOwnProperty('access_token')
  ) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }
  return request;
};

const acceptJson = request => {
  request.headers.Accept = 'application/json';
  return request;
};

module.exports = [includeBearerToken, acceptJson];
