# SSL key and certificate (development only)

This folder contains the self-signed certificate used for exposing the application via HTTPS in development.

Generate the local private key before starting the app in development:

```sh
openssl genrsa -out src/main/resources/localhost-ssl/localhost.key 2048
```

The generated key is ignored by Git and must not be committed.
