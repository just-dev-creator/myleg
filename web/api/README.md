# Overview
This is the backend of the Angular front end. It communicates directly with the MongoDB database and also takes care of secure authentication, management and creation of user accounts.
# Prerequisites
You can find an example of these values in the file `.env.example`. However, when using Vercel as a provider, these must be set via the CLI or via the settings on the website.
## MongoDB
Set the environment variable `mongodb_uri` to your connection string with low privileges (only read access on selected databases and collections).

Set the environment variable `mongodb_uri_account` to your connection string with high privileges on the account collection (read/write). 
## JWT
Set the environment variable `jwt_token` to a randomly generated string.
## Sendgrid
Set the environment variable `sendgrid` to your sendgrid api key. 

# Deployment
These files can be used unchanged only by Vercel and its serverless functions infrastructure.
It is relatively easy to modify the functions for your own and specialized use, but I do not plan to implement this myself in the short or medium term. I am very happy with Vercel's product, especially because of their extensive free services, and it saves me a lot of work and time.
