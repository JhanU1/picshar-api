# express-mongo-api

Template to create an API with Express + MongoDB.

This template uses `import/export` from ECMAScript6, and also has ESLint + editorconfig. 
This API only has three endpoints:
- `GET /`: Returns a Hello World
- `GET /users`: Get all users
- `POST /users`: Create a new user

## Setup
Install packages with yarn
```
yarn
```

Copy `.env.example` to `.env` file and fill the env vars:
```
cp .env.example .env
```

## Run

### Development mode
```
yarn dev
```

### Production mode
```
yarn start
```
