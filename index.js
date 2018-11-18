/*
Zapier App to automate ERPNext.
Copyright (C) 2018  Raffael Meyer <raffael@alyf.de>

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

const packageJson = require('./package.json');
const zapierPlatformCore = require('zapier-platform-core');
const Authentication = require('./authentication');
const DocumentResource = require('./resources/document');
const DocTypeListResource = require('./resources/doctype');

const requestMiddleware = require('./middleware/request');
const responseMiddleware = require('./middleware/response');

// ------------------- APP DEFINITION -------------------
// Roll up all behaviors in an App.
const App = {
  authentication: Authentication,
  // This is just shorthand to reference the installed dependencies you have.
  // Zapier will needs to know these
  version: packageJson.version,
  platformVersion: zapierPlatformCore.version,
  // optional hooks into the provided HTTP client
  beforeRequest: requestMiddleware,
  afterResponse: responseMiddleware,
  // Define resources to simplify creation of triggers, searches, creates
  resources: {
    // Main Resources
    [DocumentResource.key]: DocumentResource,
    // Helper Resources
    [DocTypeListResource.key]: DocTypeListResource,
  },
};

// Finally, export the app.
module.exports = App;
