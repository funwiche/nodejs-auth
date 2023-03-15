# Nodejs Auth

Send emails from your Nuxtjs App using Nodemailer. Rich user interface to send emails and attachments.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install
```

Create a `.env` file and add the following variables:

```bash
DB_URL= #MongoDB
ACCESS_TOKEN_SECRET= #JsonWebToken Secret
GOOGLE_CLIENT_ID= #Google Client ID
GOOGLE_CLIENT_SECRET= #Google CLient Secret
FACEBOOK_CLIENT_ID=  #Facebook Client ID
FACEBOOK_CLIENT_SECRET=  #Facebook CLient Secret
```

## Development Server

Start the development server on http://localhost:3000

```bash
# yarn
yarn dev

# npm
npm run dev
```

## Routes

#### Authentication

- POST ~/auth/register
- POST ~/auth/login
- POST ~/auth/forgot
- PATCH ~/auth/reset

#### Oauth2

- GET ~/oauth2/google
- GET ~/oauth2/google/redirect
- GET ~/oauth2/facebook
- GET ~/oauth2/facebook/redirect

#### Users

**Note:** All routes takes auth middleware to verify user using token sent in request header

- GET ~~~~/users
- PATCH ~~/users/password
- PATCH ~~/users/name
- PATCH ~~/users/email
- DELETE ~/users
