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

Open ERPNext, create new Social Login Keys:

* Provider: Frappe
* Client ID, Client Secret: random
* Base URL: https://alyf.de

>The Base URL you enter into ERPNext has to be your Second-Level-Domain (https://alyf.de), even if your ERPNext runs under a subdomain (https://my-company.alyf.de).

Get your app's Redirect URI from Zapier:

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

```bash
zapier env 0.0.1 CLIENT_ID f9a3905f4c
zapier env 0.0.1 BASE_URL https://my-company.alyf.de
```

Notice that the Base URL for zapier is the _actual_ URL of your ERPNext server, NOT your Second-Level-Domain.

Log into Zapier and create a new Zap. In the _Choose Account_ step of your new Zap you should be able to authenticate with ERPNext and successfully _Test_ your credentials.
