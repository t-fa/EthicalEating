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
