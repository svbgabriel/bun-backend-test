# A bun backend test

This's a small project reworked to study the javascript/typescript runtime bun and it's ecosystyem.

It creates a user, updates his session and show his information. Consult the swagger page to additional info.

## Stack

- bun
- typescript
- elysia
- MongoDB

## Development

The following environment variables are used:

```
DB_URL = MongoDB URL
SECRET = Key used to encrypt the password
TTL = Time in seconds of the jwt token expiration
```

These variables can be set using a .env file

To start the development server run:

```sh
bun run dev
```

You can check if the application is running on the following url:

http://localhost:3000/swagger
