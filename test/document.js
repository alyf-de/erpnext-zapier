/*
Zapier App to automate ERPNext.
Copyright (C) 2018 Raffael Meyer <raffael@alyf.de>

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

const should = require('should');
const zapier = require('zapier-platform-core');
const App = require('../index');
const nock = require('nock');
const { RESOURCE_ENDPOINT } = require('../constants');
const appTester = zapier.createAppTester(App);

zapier.tools.env.inject();

// TODO: Test Create, List

describe('Document Resource', () => {
  it('should run get', done => {
    const bundle = { inputData: { name: 'TEST-00001', doctype: 'Test' } };

    nock(process.env.BASE_URL, {
      reqheaders: {
        'user-agent': ['Zapier'],
        'accept-encoding': ['gzip,deflate'],
        connection: ['close'],
        accept: ['application/json'],
      },
    })
      .get(
        `${RESOURCE_ENDPOINT}/${bundle.inputData.doctype}/${
          bundle.inputData.name
        }`
      )
      .reply(200, { data: { name: bundle.inputData.name } });

    appTester(App.resources.document.get.operation.perform, bundle)
      .then(results => {
        should.exist(results);
        done();
      })
      .catch(done);
  });

  it('should run search', done => {
    const bundle = {
      inputData: {
        doctype: 'Test',
        fields: ['name', 'test_prop'],
        filter_property: 'test_prop',
        filter_operator: '=',
        filter_value: 'TEST-00001',
        limit_page_length: 20,
      },
      authData: {
        access_token: 'a_token',
        refresh_token: 'a_refresh_token',
      },
    };

    nock(process.env.BASE_URL, {
      reqheaders: {
        'user-agent': ['Zapier'],
        authorization: [`Bearer ${bundle.authData.access_token}`],
        'accept-encoding': ['gzip,deflate'],
        connection: ['close'],
        accept: ['application/json'],
      },
    })
      .get(`${RESOURCE_ENDPOINT}/${bundle.inputData.doctype}`)
      .query({
        fields: JSON.stringify(bundle.inputData.fields),
        filters: JSON.stringify([
          [
            // array inside array because you could apply multiple filters
            bundle.inputData.doctype,
            bundle.inputData.filter_property,
            bundle.inputData.filter_operator,
            bundle.inputData.filter_value,
          ],
        ]),
        limit_page_length: bundle.inputData.limit_page_length,
        limit_start: 0,
      })
      .reply(
        200,
        JSON.stringify({ data: [{ name: 'TEST-00001', doctype: 'Test' }] })
      );

    appTester(App.resources.document.search.operation.perform, bundle)
      .then(results => {
        should.exist(results[0]);
        should.exist(results[0].id);
        should.equal(results[0].id, 'TEST-00001');
        should.equal(results[0].doctype, 'Test');
        done();
      })
      .catch(done);
  });
});

describe('Webhook', () => {
  it('should register', done => {
    const bundle = {
      inputData: {
        doctype: 'Test',
        triggerEvent: 'after_insert',
      },
      authData: {
        access_token: 'a_token',
      },
      targetUrl: 'https://example.org',
    };

    nock(process.env.BASE_URL, {
      reqheaders: {
        'content-type': ['application/json'],
        accept: ['application/json'],
        'user-agent': ['Zapier'],
        authorization: [`Bearer ${bundle.authData.access_token}`],
        'accept-encoding': ['gzip,deflate'],
        connection: ['close'],
        'content-length': ['145'],
      },
    })
      .post(`${RESOURCE_ENDPOINT}/Webhook`, {
        request_url: bundle.targetUrl,
        webhook_doctype: bundle.inputData.doctype,
        webhook_docevent: bundle.inputData.triggerEvent,
        webhook_data: [{ fieldname: 'name', key: 'id' }],
      })
      .reply(200, {
        data: {
          webhook_data: [
            {
              doctype: 'Webhook Data',
              parenttype: 'Webhook',
              fieldname: 'name',
              key: 'id',
              parentfield: 'webhook_data',
            },
          ],
          name: `${bundle.inputData.doctype}-${bundle.inputData.triggerEvent}`,
          doctype: 'Webhook',
          webhook_docevent: bundle.inputData.triggerEvent,
          request_url: bundle.targetUrl,
          webhook_doctype: bundle.inputData.doctype,
        },
      });

    appTester(App.resources.document.hook.operation.performSubscribe, bundle)
      .then(results => {
        should.exist(results);
        done();
      })
      .catch(done);
  });

  it('should unregister', done => {
    const bundle = {
      subscribeData: {
        name: 'Test-after_insert',
      },
      authData: {
        access_token: 'a_token',
      },
    };

    nock(process.env.BASE_URL, {
      reqheaders: {
        'user-agent': ['Zapier'],
        authorization: [`Bearer ${bundle.authData.access_token}`],
        'accept-encoding': ['gzip,deflate'],
        connection: ['close'],
        accept: ['application/json'],
      },
    })
      .delete(`${RESOURCE_ENDPOINT}/Webhook/${bundle.subscribeData.name}`)
      .reply(202, { message: 'ok' });

    appTester(App.resources.document.hook.operation.performUnsubscribe, bundle)
      .then(results => {
        should.exist(results);
        done();
      })
      .catch(done);
  });

  it('should request distinct data', done => {
    const bundle = {
      inputData: {
        doctype: 'Test',
        triggerEvent: 'after_insert',
        // input duplicate data:
        // name (duplicate because it's already included by default) and the same field twice
        webhookData: ['name', 'test', 'test'],
      },
      authData: {
        access_token: 'a_token',
      },
      targetUrl: 'https://example.org',
    };

    nock(process.env.BASE_URL, {
      reqheaders: {
        'content-type': ['application/json'],
        accept: ['application/json'],
        'user-agent': ['Zapier'],
        authorization: [`Bearer ${bundle.authData.access_token}`],
        'accept-encoding': ['gzip,deflate'],
        connection: ['close'],
        'content-length': ['179'],
      },
    })
      .post(`${RESOURCE_ENDPOINT}/Webhook`, {
        request_url: bundle.targetUrl,
        webhook_doctype: bundle.inputData.doctype,
        webhook_docevent: bundle.inputData.triggerEvent,
        webhook_data: [
          {
            fieldname: 'name',
            key: 'id',
          },
          {
            fieldname: 'test',
            key: 'test',
          },
        ],
      })
      .reply(200, { data: {} });

    appTester(App.resources.document.hook.operation.performSubscribe, bundle)
      .then(results => {
        should.exist(results);
        done();
      })
      .catch(done);
  });
});
