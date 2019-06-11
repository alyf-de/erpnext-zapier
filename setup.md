---
title: Set Up ERPnext Zapier App on Ubuntu 18.04
author: Raffael Meyer, ALYF Consulting, <raffael@alyf.de>
date: \today
---

## Versions

Software             | Version
---------------------|----------
Ubuntu               | 18.04.2
NodeJS               | 8.10.0
zapier-platform-cli  | 8.0.1
zapier-platform-core | 7.4.0
ERPNext              | v11.1.21
Frappe               | v11.1.22

## Guide

### 1. Start a fresh Ubuntu

```bash
docker run -it ubuntu:latest
```

### 2. Now, inside Ubuntu, set up the requirements for the erpnext-zapier app

```bash
apt update
apt install git
apt install nodejs npm
npm install -g zapier-platform-cli
npm install zapier-platform-core
```

### 3. Authenticate to Zapier. Clone the app source code, build and deploy it

```bash
zapier login
git clone https://github.com/alyf-de/erpnext-zapier.git
cd erpnext-zapier
npm install
zapier push
```

### 4. Set up ERPNext

We'll assume that your ERPNext instance is hosted at https://my-company.alyf.de.

Open ERPNext, create new Social Login Keys:

* Provider: Frappe
* Client ID, Client Secret: random
* Base URL: https://alyf.de

>The Base URL you enter into ERPNext has to be your Second-Level-Domain (for example, https://alyf.de), even if your ERPNext runs under a subdomain (for example, https://my-company.alyf.de).

Get your app's _Redirect URI_ from Zapier:

```bash
zapier describe

-------------------------------------------------------------------------------------
| Authentication
| 
| Type                  oauth2                                                         
| Redirect URI          https://zapier.com/dashboard/auth/oauth/return/App17218CLIAPI/  
-------------------------------------------------------------------------------------              
```

In ERPNext, create a new _OAuth Client_ with Redirect URI from above as _Redirect URIs_ and _Default Redirect URI_. Save and copy the Client ID.

### 5. Set Up the Zapier Environment

Run these commands to put your configuration into the apps environment. Remember to replace the values at the end of each line (`f9a3905f4c`, `ds8fd8vc5xx`, `https://my-company.alyf.de`) with the actual values for your instance.

```bash
zapier env 0.0.2 CLIENT_ID f9a3905f4c
zapier env 0.0.2 CLIENT_SECRET ds8fd8vc5xx
zapier env 0.0.2 BASE_URL https://my-company.alyf.de
```

Notice that the Base URL for zapier is the _actual_ URL of your ERPNext server, NOT your Second-Level-Domain.

Log into Zapier and create a new Zap. In the _Choose Account_ step of your new Zap you should be able to authenticate with ERPNext and successfully _Test_ your credentials.
