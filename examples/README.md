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

## CommitIDs documents

To get the id of the last commit, use `tuscli -y` and when combined with `jq` it's easy to select the last commit id:

```
tuscli -y 1 | jq -r '[.[]."Commit ID"."@value" ] | last'
```

And example commit id looks like this: `aqf2glrl7c646ksrt5vyw2lycmd8a03`

The commit ID can then be used for example with the `-t` flag to perform operations on a specific branch. The `Time/@value` represents non-leap-seconds since Unix Epoch.

