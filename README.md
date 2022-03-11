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