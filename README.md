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
For now the backend will be deployed on our staging server. For this we created a new directory under */projects/siegenia-api/siegenia-prod*.
Make sure you have your ssh-key stored on the staging server as you otherwise won't be able to copy the files there.

1. Create a build from the branch which you want to deploy
```bash
$ yarn build
```

2. Re-build docker image and upload it as compressed file to the server
```bash
$ yarn deploy:api
```

3. Connect with the server
```bash
$ ssh root@staging.mobile-software.ag
```

4. Load the uploaded image into docker
```bash
//In projects/siegenia-api/siegenia-prod 
$ docker load -i siegenia-api-prod.tar
```

5. Remove old container and create new with latest image
```bash
$ docker stop siegenia-api-prod
$ docker rm siegenia-api-prod
$ docker-compose up -d
```

## Staging DB
- In order to connect to the staging db you have to open the docker container:
  ```bash
  $ docker exec -it siegenia-db bash
  ```
- Login with your database user:
  ```bash
  $ psql -U postgres
  ```
- Connect with your database:
  ```bash
  $ \c siegenia-db
  ```
- Show all tables:
  ```bash
  $ \dt
  ```