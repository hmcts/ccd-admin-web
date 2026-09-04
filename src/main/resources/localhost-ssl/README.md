# SSL certificate (development only)

This folder contains a self-signed certificate for exposing the application via HTTPS in development.
The matching private key must be generated locally and must not be committed.

Generate a local private key with:

```sh
openssl genrsa -out src/main/resources/localhost-ssl/localhost.key 2048
```

The generated key is ignored by Git.
