# JIRA BACKEND REST APIs

## _SETUP_

## DB DIAGRAM

- [DBDIAGRAM]

## POSTMAN COLLECTION

- [POSTMAN]

## Minio Media Server

- Create a folder minio-server.
- `cd minio-server`
- `curl --progress-bar -O https://dl.min.io/server/minio/release/darwin-amd64/minio`
- `chmod +x minio`
- Create a directory mnt and inside mnt create one more directory data.
- Starting minio server.
- `MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=password ./minio server /Users/arpitkumar/Desktop/minio/mnt/data --console-address ":9001"`
- Minio server is up and running.
- Go to http://127.0.0.1:9001 and login in minio server
- Create access key and secret key

## Running Express Epplication

- Clone the backend application.
- Enter into application and run the command
- `npm install or npm i`
- Setup the environment variables.
- Create a .env file in root structure of project and setup below environment variables
- `DATABASE_URL="postgresql://<DB_USERNAME>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DATABASE_NAME>?schema=public"`
- `JWT_SECRET=<YOUR_JWT_SECRET_KEY>`
- `MINIO_ENDPONT=127.0.0.1` (If running on your local computer)
- `MINIO_ACCESS_KEY=<YOUR_MINIO_ACCESS_KEY>` (Generated in above set)
- `MINIO_SECRET_KEY=<YOUR_MINIO_SECRET_KEY>` (Generated in above set)
- `MINIO_ATTACHMENTS_BUCKET_NAME=<YOUR_BUCKET_NAME_FOR_ATTACHMENTS>`
- `MINIO_PROFILE_IMAGES_BUCKET_NAME=<YOUR_BUCKET_NAME_FOR_USER_PROFILE_IMAGE>`
- Run `npm run start` and your APIs are up and running.

[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[DBDIAGRAM]: https://dbdiagram.io/d/6654321df84ecd1d223757f6
[POSTMAN]: https://git.geekyants.com/arpitk/jira-backend/-/blob/feat/readme/jira-backend.postman_collection.json
