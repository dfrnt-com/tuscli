# Examples of usage

## System documents

Query to get the users in the system database

```
$ tuscli -x -q '{"type":"User"}'
```

Add a new JWT-authenticated user (thus requiring only the email address present in the claims)

```
$ tuscli -x -c system/addUser.json
```

