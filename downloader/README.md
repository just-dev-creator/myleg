# Overview
This NodeJS script retrieves the current substitution plans, downloads them as HTML files and then processes them. Finally, it stores them in a MongoDB database. It also sends update/creation notifications to relevant users via the FCM API.
It is intended to be run via a cron job.
# Prerequisites
## Firebase Cloud Messaging
Please place your serviceAccountKey in the file `./serviceAccountKey.json`. If the file is not present, errors will occur when sending messages.
## MongoDB
Set the environment variable `MONGODB_CONNECTION_STRING` to your connection string. You are encouraged to use the `.env.example` file for this purpose.
## DSBMobile creds
Set the environment variable `DSBMOBILE_ID` to your DSBMobile ID number and `DSBMOBILE_PASSWORD` to your DSBMobile password. We recommend that you use the .env.example file for this purpose.

# Deployment
## Install
```shell
cd ./downloader
yarn
```
## Run
```shell
npm start
```
## Logs
The logs are output via pino in JSON format to STDOUT. 