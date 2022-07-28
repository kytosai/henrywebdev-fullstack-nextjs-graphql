# Docker

- Command connect to container

```sh
docker exec -it eced735abf01 /bin/sh
```

- Run bellow command to connect postgresql with user `user01` and location `localhost`

```sh
psql -U user01 -h localhost
```