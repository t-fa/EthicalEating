# EthicalEating

CS 361 Ethical Eating web app by Zero Rows Returned

## running locally with docker-compose

This is optional but I like testing locally with Docker, so you can do so too if you want. It's not required to develop, you can simply run a local SQL server and run the app with node app.js.

If you'd like to run the app locally, you can download Docker Desktop: https://www.docker.com/products/docker-desktop
Then from the root folder in this repo, run:

```
docker-compose build
docker-compose up -d
```

The app has been configured with [nodemon](https://www.npmjs.com/package/nodemon) to hot-reload the app container whenever the source code changes. This way, you don't have to bring the container down and back up again when you make a change in the source code in order to see the behavior reflected. This makes development faster.

If you don't want this behavior, simply change the `command: "npm run dev"` line in docker-compose.yml to `command: "npm start"` and hot-reloading will no longer occur.

To stream logs:
`docker-compose logs -f`

To stop streaming logs: `Control+C`

To stop:
`
docker-compose down
`

To re-build, like when you change source code or similar, run `docker-compose build` again, and then
`docker-compose up`.

You can use the --force-recreate flag if changes don't seem to be sticking.

`docker-compose up --force-recreate`

You will be able to view the app locally at http://localhost:6377.

## viewing the mysql database with mysql workbench

It can be useful for debugging to see what is in the database using [mysql workbench](https://www.mysql.com/products/workbench/), a free tool. If you would like to use the app with mysql workbench, first download the software. Then, make one small change to the docker-compose file to the db: ports: section, changing `"3306"` to `"127.0.0.1:3306:3306"` to expose the database on port 3306 on your localhost.