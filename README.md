# Quiz back-end

## Requirements

* NodeJS (version: 12.13.1)

### MongoDB database
* Instance of MongoDB (Version: 4.4)
* Creation of a user allowed to create and alter databases

## Set-up for development

### Install dependencies

```
npm install
```

### Create configuration

Create a configuration `app.development.ini` in `config` based on the template configuration.

### Run

```
npm run start:dev
```

Server will automatically restart when a change in files is detected.

## Set-up for production

Create a configuration `app.production.ini` in config based on the template configuration.

### Local installation

```
npm install
npm run start:prod
```

### Docker installation

A dockerfile is already provided, so you can build a docker image of this application.

## Common commands

### Tests

Create a configuration `app.test.ini` in `config` based on the template configuration.

```
npm run test
```

### Code style

`npm run lint` to check code style and `npm run lint:fix` to fix it.
