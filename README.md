[Zapier](https://zapier.com) App to automate [ERPNext](https://erpnext.com). Deploy this app to Zapier and connect thousands of other apps to your ERP-System, for example, Google Forms, Calendly or Stripe. At the moment, creating Leads or Opportunities works especially well.

> Tested only on ERPNext Version 11

![Zapier Screenshot](/img/zap_trigger.png)

# Getting started

* Clone this repository,
* Install the [Zapier CLI](https://zapier.com/developer/documentation/v2/getting-started-cli/#installing-the-cli):
```bash
    npm install -g zapier-platform-cli
    zapier login
```
* Install dependencies
```bash
    npm install
```
* [Deploy this app](https://zapier.com/developer/documentation/v2/getting-started-cli/#deploying-an-app)
```bash
    zapier push
```
* Set the base URL of your ERPNext instance, for example https://demo.erpnext.com (without trailing `/` slash).
```bash
    zapier env 0.0.1 BASE_URL https://demo.erpnext.com
```
* Get your client ID from ERPNext (details below) an let zapier know about it:
```bash
    zapier env 0.0.1 CLIENT_ID abcd1234
```

# Set up oAuth in ERPNext
Please follow Frappe's guide on [How to set up oAuth](https://frappe.io/docs/user/en/guides/integration/how_to_set_up_oauth) in ERPNext.

If this is your first time configuring oAuth you'll need to set your second-level-domain in ERPNext. For example, if your instance runs at https://erp.domain.tld, use https://domain.tld (without the "erp" subdomain). In ERPNext, go to `Setup > Integrations > Social Login Keys`, enter your second-level-domain in the field called "Frappe Server URL" and hit save. (If you don't do this you will later get a 417 ValidationError in Zapier.)

Next, run `zapier describe` in the app folder to find this output: 

```
Authentication

┌────────┬───────────────────────────────────────────────────────────────┬────────────────────────────────────────────────┐
│ Type   │ Redirect URI                                                  │ Available Methods                              │
├────────┼───────────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ oauth2 │ https://zapier.com/dashboard/auth/oauth/return/App0000CLIAPI/ │ authentication.test                            │
│        │                                                               │ authentication.oauth2Config.getAccessToken     │
│        │                                                               │ authentication.oauth2Config.refreshAccessToken │
└────────┴───────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

In ERPNext, go to `Setup > Integrations > OAuth Client` and click **New**. (You need to have the *System Manager* role.)

To add a client for Zapier fill in the following details:

1. App Name: Zapier (or whatever you like)
2. Redirect URIs: use the Redirect URI from the output above.
3. Default Redirect URIs: use the Redirect URI from the output above.

Leave all other fields to default and hit save.

Now you should see the `App Client ID`. [Set it as environment variable](https://zapier.github.io/zapier-platform-cli/#testing--environment-variables) CLIENT_ID using the following command:

```bash
zapier env 0.0.1 CLIENT_ID abcd1234
```

When you run `zapier env 0.0.1` it should look similar to this:

```
┌─────────┬───────────────┬──────────────────────────────┐
│ Version │ Key           │ Value                        │
├─────────┼───────────────┼──────────────────────────────┤
│ 0.0.1   │ BASE_URL      │ https://demo.erpnext.com     │
│ 0.0.1   │ CLIENT_ID     │ abcd1234                     │
└─────────┴───────────────┴──────────────────────────────┘
```

# Lets go!

Your app is ready to start. Head over to zapier.com and [create a new Zap](https://zapier.com/app/editor/).

### Compatibility

* Dates must be passed as strings of form `YYYY-MM-DD`.

### Contact

[Alyf.de](https://alyf.de) / [raffael@alyf.de](mailto:raffael@alyf.de)

### License

Copyright (C) 2018 Raffael Meyer <raffael@alyf.de>

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
