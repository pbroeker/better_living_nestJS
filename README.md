# Siegenia Backend

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start:dev
```

## Local SetUp

### Docker
#### Requirements
 - [Docker](https://docs.docker.com/get-docker/)

```bash
# Build docker image
$ docker build .

# Start Docker containers
$ docker-compose up 

# Stop Docker containers
$ docker-compose down

```
#### PG ADMIN
In order to use the PG ADMIN interface you have to follow these steps:

1. Start docker containers
```bash
$ docker-compose up 
```

2. Open PG Admin in browser
```
localhost:8080
```

3. Enter login credentials from env-file

4. Create new server
  - General -> Choose name of your choise
  - Connection -> Enter the values from your env file
    - Host name/address: POSTGRES_HOST from your env-file
    - Port: 5432
    - Maintenance database
    - Username
    - Password
5. Save
6. Now you can see your database/tables etc.

## Deployment Staging
For now the backend will be deployed on our staging server. For this we created a new directory under */projects/siegenia-api*.

There the bitbucket repository together with the docker files is being stored. In order to add the latest code changes just pull from the deployment branch and restart the docker container:

```bash
$ git checkout main
$ git pull
$ docker-compose down
$ docker-compose up -d
```