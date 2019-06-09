/*
Zapier App to automate ERPNext.
Copyright(C) 2018 Raffael Meyer <raffael@alyf.de>

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
  CLIENT_ID,
  OAUTH_TOKEN_METHOD,
  OAUTH_TEST_METHOD,
} = require('./constants');

const { getAuthorizeRequest, getMethod, postMethod } = require('./api');

module.exports = {
  type: 'oauth2',
  oauth2Config: {
    // Step 1 of the OAuth flow; specify where to send the user to authenticate with your API.
    // Zapier generates the state and redirect_uri
    authorizeUrl: getAuthorizeRequest(),
    // Step 2 of the OAuth flow; Exchange a code for an access token.
    // This could also use the request shorthand.
    getAccessToken: z => {
      return postMethod(z, OAUTH_TOKEN_METHOD, {
        code: '{{bundle.inputData.code}}',
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
      }).then(response => {
        return response;
      });
    },
    // (Optional) If the access token expires after a pre-defined amount of time, you can implement
    // this method to tell Zapier how to refresh it.
    refreshAccessToken: z => {
      return postMethod(z, OAUTH_TOKEN_METHOD, {
        refresh_token: '{{bundle.authData.refresh_token}}',
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
      });
    },
    // If you want Zapier to automatically invoke `refreshAccessToken` on a 401 response, set to true
    autoRefresh: true,
    scope: 'all',
  },
  // The test method allows Zapier to verify that the access token is valid.Zapier will execute this
  // method after the OAuth flow is complete to ensure everything is setup properly.
  test: z => {
    // This method can return any truthy value to indicate the credentials are valid.
    return getMethod(z, OAUTH_TEST_METHOD).then(response => {
      if (!response.hasOwnProperty('message')) {
        // credentials are not valid
        return false;
      }
      return {
        // return username as connection label (truthy)
        // will become available in bundle.inputData
        user: response.message,
      };
    });
  },
  // assuming "user" is a key returned from the test
  connectionLabel: '{{bundle.inputData.user}}',
};
