'use strict';

const BASE_URL = process.env.BASE_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const METHOD_ENDPOINT = '/api/method';
const RESOURCE_ENDPOINT = '/api/resource';

const OAUTH_AUTHORIZE_METHOD = 'frappe.integrations.oauth2.authorize';
const OAUTH_TOKEN_METHOD = 'frappe.integrations.oauth2.get_token';

// Method that is either specifically designed to test auth, or one that every user
// will have access to, such as an account or profile endpoint like /me.
const OAUTH_TEST_METHOD = 'frappe.auth.get_logged_user';

const OAUTH_AUTHORIZE_ENDPOINT = METHOD_ENDPOINT + '/' + OAUTH_AUTHORIZE_METHOD;
const OAUTH_TOKEN_ENDPOINT = METHOD_ENDPOINT + '/' + OAUTH_TOKEN_METHOD;
const OAUTH_TEST_ENDPOINT = METHOD_ENDPOINT + '/' + OAUTH_TEST_METHOD;

module.exports = {
  BASE_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_AUTHORIZE_METHOD,
  OAUTH_TOKEN_METHOD,
  OAUTH_TEST_METHOD,
  METHOD_ENDPOINT,
  RESOURCE_ENDPOINT,
  OAUTH_AUTHORIZE_ENDPOINT,
  OAUTH_TOKEN_ENDPOINT,
  OAUTH_TEST_ENDPOINT,
};
