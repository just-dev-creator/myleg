# myLeG
## Overview
This project shows the substitutions of my school to show only the entries that are actually relevant for the end user. The code can be used unchanged actually only for this special case, however, with the help of a few changes theoretically every school with a structure from DSBMobile and Units can serve as a data basis. Currently the project (or more precisely the API) can only be used with the Vercel infrastructure, but the syntax used is easily transferable to other serverless functions providers or an express server. The front-end can be hosted on any web server.

## Project structure
The project is basically divided into three parts, which I will now present in detail. 
### 1. Downloader
`./downloader`

This NodeJS script retrieves the current substitution plans, downloads them as HTML files and then processes them. Finally, it stores them in a MongoDB database. It also sends update/creation notifications to relevant users via the FCM API.
It is intended to be run via a cron job. 
#### Install
```shell
cd ./downloader
yarn
```
#### Run
```shell
npm start
```
#### Logs
The logs are output via pino in JSON format to STDOUT. 

### 2. API
`./web/api`

This is the backend of the Angular front end. It communicates directly with the MongoDB database and also takes care of secure authentication, management and creation of user accounts.
#### Install & run
These files can be used unchanged only by Vercel and its serverless functions infrastructure.
It is relatively easy to modify the functions for your own and specialized use, but I do not plan to implement this myself in the short or medium term. I am very happy with Vercel's product, especially because of their extensive free services, and it saves me a lot of work and time. 

### 3. Frontend
`./web`

The frontend was written in Angular and currently contains only the bare minimum of functions needed for the main goal of the project. However, due to the existing communication infrastructure, the implementation of upcoming features will be comparatively fast.
#### Install
```shell
cd ./web
yarn
```

#### Run
*stand-alone (without backend)*
```shell
yarn start 
```
*via vercel (with backend)*
```shell
vercel dev
```
#### Build
```shell
yarn build
```
