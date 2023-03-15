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

|POST|/auth/register|//Register
|POST|/auth/login|//Login user
|POST|/auth/forgot|//Request code to reset password
|PATCH|/auth/reset|//Reset password

#### Oauth2

#### Users
