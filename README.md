# tuscli - Independent TerminusDB Javascript document cli

Note: Tuscli was previously `hoijnet/tuscli`. [DFRNT](https://dfrnt.com) assumed maintainership 2023-01-21.

Interact with TerminusDB and DFRNT from the commandline to import/export documents and setup your schema. 

This open source tool is built to work with portable graph data products from the command line. We, [DFRNT](https://dfrnt.se?utm_source=github&utm_content=tuscli), believe that the JSON-LD document and triples knowledge encoding, is a great bearer of structured data for organisations and initiatives. DFRNT is built upon the [TerminusDB](https://terminusdb.com) engine, and this is a client for it. This tuscli tooling integrates [TerminusDB](https://terminusdb.com) data and complements the [DFRNT](https://dfrnt.se?utm_source=github&utm_content=tuscli) platform. 

Check out [DFRNT](https://dfrnt.com?utm_source=github&utm_content=tuscli) to try our graph data product platform.

## Requirements unless using a prepackaged form

* [NodeJS](https://nodejs.org/en/)

## Usage

Interact with TerminusDB from the commandline to import/export documents and setup the schema.

```bash
$ export TUSPARAMS="$(echo '{"url":"http://localhost:6363","key":"password","user":"admin","organisation":"admin","db":"mydb"}' | base64 )"
$ npm install
$ node dist/tuscli.js
```

Build a docker image with tuscli as a binary in it, note that nexe itself takes a long time to compile.

```bash
$ docker build --pull -t tuscli -f docker/Dockerfile .
$ docker run --rm -it tuscli --help
$ echo '{ "@id": "newenum", "@type": "Enum", "@value": [ "mytest" ] }' > examples/newenum.json
$ docker run --rm -it -e TUSPARAMS="$TUSPARAMS" -v "`pwd`"/examples:/json tuscli -i schema -c /json/newenum.json
```

To build an executable tuscli file with embedded node.js in it:

```bash
$ npm run buildnexe
$ ./tuscli --help
```

Install tuscli globally on your system

```bash
$ sudo npm install -g @hoijnet/tuscli
```

When running with docker and docker-compose, use the correct host, and add the docker network to connect run the command with.

```bash
$ export TUSPARAMS="$(echo '{"url":"http://localhost:6363","key":"password","user":"admin","organisation":"admin","db":"mydb"}' | base64 )"
$ docker run --rm -it --network terminusdb_default -e TUSPARAMS="$TUSPARAMS" hoijnet/tuscli --help
$ docker run --rm -it --network terminusdb_default -e TUSPARAMS="$TUSPARAMS" hoijnet/tuscli --export-schema
$ docker run --rm -it --network terminusdb_default -e TUSPARAMS="$TUSPARAMS" hoijnet/tuscli --query-document '{"type":"Person"}'
$ docker run --rm -it --network terminusdb_default -e TUSPARAMS="$TUSPARAMS" hoijnet/tuscli --read Person/johndoe
$ docker run --rm -it --network terminusdb_default -e TUSPARAMS="$TUSPARAMS" hoijnet/tuscli --delete Person/johndoe
$ docker run --rm -it --network terminusdb_default -e TUSPARAMS="$TUSPARAMS" hoijnet/tuscli --instance schema --read Person
```


## Examples

```
$ node dist/tuscli.js --createBranch mybranch true
$ node dist/tuscli.js --branch mybranch --export-schema
$ node dist/tuscli.js --query-document '{"type":"Person"}'
$ node dist/tuscli.js --read Person/johndoe
$ node dist/tuscli.js --delete Person/johndoe
$ node dist/tuscli.js --instance schema --create "`pwd`/schemaDocument.json"
$ node run buildnexe
$ ./tuscli --instance schema --update Person ./person.json
```

To import and export, make sure that the coloring is removed from the json, and remove the TerminusDB schema preamble. Then it is possible to import the JSON array of documents with `--instance schema`and `--create` flags. Can be helpful to try in a separate branch as well.  

Additional examples can be found in the examples folder, including an example of CSV document import using WOQL.

## Motivation and Features

* Load documents into TerminusDB from the cli
* Interact with schema, system and instance parts of TerminusDB from the cli
* It was easier for me to get started in Javascript 😄
* Consider using the official [TerminusDB Python scaffolding cli](https://terminusdb.github.io/terminusdb-client-python/Scaffolding_CLI_Tool.html) instead, one that has these and more advanced features! 

## Project goals

* Make it easy to import/export schema/system/instance TerminusDB documents to/from disk
* Make it easy to interact with TerminusDB from the command line
* Show simple usage of the Javascript TermimusDB SDK
* Enable interaction with other on-disk JSON manipulation tools
* Easy of use, stability and correctness to be a higher priority than many features

## tuscli options

```
Usage: tuscli [options]

TerminusDB Javascript cli: tuscli [options] <fileName(s)>

Options:
  -V, --version                                    output the version number
  -c, --create                                     create document from provided file
  --createFromJson                                 create document from supplied JSON, like '{"@id":"Entity/1",
                                                   "@type":"Entity"}'
  -r, --read <document-id>                         read document-id (Type/id)
  -s, --schemaFrame <document-id>                  get the schema frame for a type/subdoctype/enum
  -u, --update <document-id>                       update document
  -d, --delete <document-id>                       delete document
  -q, --query-documents <query-template-json>      list documents of type, example: {"type":"Person"}
  -e, --export-schema                              export/show instance schema JSON
  -p, --profile <json-file>                        JSON-formatted connection profile, or set env TUSPARAMS in base64
                                                   encoding
  -z, --dump-profile                               show the default or current connection profile, and how to set it
  -o, --optimize <main>                            optimize and do delta rollups on a branch
  --createDatabase <dataproduct-id> <create-json>  create data product, default JSON: {"schema":true, "label": "",
                                                   "comment":""}
  --deleteDatabase <dataproduct-id>                delete database/data product
  --deleteDocumentsOfType <type>                   delete all documents of a type
  --deleteDocumentsIsaType <type>                  delete documents that are is-a type
  --dataProduct <dataproduct-id>                   override dataproduct to use
  --createBranch <branch-id> <true/false>          create branch, true for empty branch
  --deleteBranch <branch-id>                       delete branch
  --branches                                       pull list of branches in the data product
  --nocolor                                        disable the colorize filter of output
  --quiet                                          disable diagnostic outputs
  -x, --system                                     connect to system database
  -y, --commitGraph <count>                        get the 10 last commits, supply an argument for more
  -i, --instance <instance|schema>                 document instance, default is instance
  -b, --branch <branch-id>                         use/select active branch
  -t, --commit <commit-id>                         use/select specific commit
  --woql <WOQL>                                    Execute JS WOQL query (as an argument)
  --compileWoql <WOQL>                             Compile JS WOQL (as an argument) into JSON WOQL
  --woqlFile <example.woql.js>                     Execute JS WOQL (from a file)
  --woqlCompile <example.woql.js>                  Compile JS WOQL into JSON WOQL (from a file)
  -h, --help                                       display help for command
```

## MCP Server (Model Context Protocol)

tuscli includes a built-in MCP server that exposes all TerminusDB operations as tools for AI assistants like Claude, Cursor, and other MCP-compatible clients.

### Launch via CLI

```bash
$ node dist/tuscli.js --mcp
```

Or using npm:

```bash
$ npm run mcp
```

### MCP Client Configuration

Add tuscli to your MCP client configuration (e.g. `claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "tuscli": {
      "command": "node",
      "args": ["/path/to/tuscli/dist/tuscli.js", "--mcp"],
      "env": {
        "TUSPARAMS": "<base64-encoded-connection-json>"
      }
    }
  }
}
```

Generate the `TUSPARAMS` value:

```bash
$ echo '{"url":"http://localhost:6363","key":"root","user":"admin","organisation":"admin","db":"mydb"}' | base64
```

### Author and Commit Messages

Every write operation in TerminusDB records an **author** and a **commit message** in the commit history, just like Git.

**Author** is derived from the `user` field in your `TUSPARAMS` connection configuration. Set this to a meaningful identifier for your use case:

```bash
# For a human user
$ echo '{"url":"http://localhost:6363","key":"root","user":"jane.doe@example.com","organisation":"admin","db":"mydb"}' | base64

# For an AI assistant
$ echo '{"url":"http://localhost:6363","key":"root","user":"ai-assistant","organisation":"admin","db":"mydb"}' | base64
```

**Commit message** can be set per-operation via the `message` parameter on every write tool (`create_document`, `update_document`, `delete_document`, `delete_documents_of_type`, `execute_woql`). If not provided, a sensible default is used (e.g., "Create document via MCP").

This means:
- The `user` field in `TUSPARAMS` controls **who** is recorded as the author of each change
- The `message` parameter on each tool controls **what** is recorded as the reason for the change
- Both appear in the commit history (viewable via `get_commit_graph`)

### Docker with MCP

```bash
$ docker run --rm -i -e TUSPARAMS="$TUSPARAMS" hoijnet/tuscli --mcp
```

### Docker Secrets

When running in Docker Swarm or Compose, tuscli can read connection configuration from Docker secrets. Create a secret named `tusparams` containing the base64-encoded connection JSON:

```yaml
# docker-compose.yml
services:
  tuscli-mcp:
    image: hoijnet/tuscli
    command: ["--mcp"]
    secrets:
      - tusparams

secrets:
  tusparams:
    file: ./tusparams.txt
```

Where `tusparams.txt` contains the base64-encoded connection JSON (same format as the `TUSPARAMS` environment variable).

The secret is read from `/run/secrets/tusparams` inside the container. The environment variable takes precedence if both are set.

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `create_database` | Create a new database |
| `delete_database` | Delete a database |
| `create_document` | Create a document from JSON |
| `read_document` | Read a document by ID |
| `update_document` | Update an existing document |
| `delete_document` | Delete a document by ID |
| `query_documents` | Query documents by type |
| `delete_documents_of_type` | Delete all documents of a type |
| `export_schema` | Export the instance schema |
| `get_schema_frame` | Get the schema frame for a type |
| `list_branches` | List branches |
| `create_branch` | Create a branch |
| `delete_branch` | Delete a branch |
| `execute_woql` | Execute a WOQL query |
| `compile_woql` | Compile WOQL to JSON AST |
| `get_commit_graph` | Get commit history |
| `optimize_branch` | Optimize a branch |
| `dump_profile` | Show connection profile |

## Contributing

This is an independent single-contributor project (so far) done in my free time so issues may take time to get resolved (pull requests get issues resolved the fastest).

* Clone [hoijnet/tuscli](https://github.com/hoijnet/tuscli)
* Share a [pull request on hoijnet/tuscli](https://github.com/hoijnet/tuscli/pulls)
* Open an issue on [Github hoijnet/tuscli](https://github.com/hoijnet/tuscli/issues)

## What needs help

* Identify missing features and file issues
* Usability/naming of the cli user interface (early feedback)
* Usage examples (scripts with documents)
* Make it more robust, this is an early version!

## Howto release new version and ensure all builds work first

To put into a `Makefile` at some point

```bash
# Bump version number in package.json
$ npm run buildnexe
$ npm run dockerize
$ git push
$ npm push
$ docker push hoijnet/tuscli
```

## How to build a self-contained command line binary with bun

```sh
bun build ./src/tuscli.ts --compile --outfile tuscli
```

## To start your MCP server with Docker

On macOS, use `host.docker.internal` to reach TerminusDB running on the host:

```json
{
  "name": "TerminusDB",
  "command": "docker",
  "args": [
    "run",
    "--rm",
    "-i",
    "-e",
    "TUSPARAMS=eyJ1cmwiOiJodHRwOi8vdGVybWludXNkYjo2MzYzIiwia2V5Ijoicm9vdCIsInVzZXIiOiJhZG1pbiIsImF1dGhvciI6ImphbmUuZG9lQGV4YW1wbGUuY29tIiwib3JnYW5pc2F0aW9uIjoiYWRtaW4iLCJkYiI6Im15ZGIifQo=",
    "ghcr.io/hoijnet/tuscli:latest",
    "--mcp"
  ]
}
```

```bash
export TUSPARAMS="$(echo '{"url":"http://terminusdb:6363","key":"root","user":"admin","author":"jane.doe@example.com","organisation":"admin","db":"mydb"}' | base64 )"
```

The `author` field in TUSPARAMS is used as the commit **author** for all write operations. Set it to a meaningful identifier (e.g., `ai-assistant`, `jane.doe@example.com`).

Or from the command line:

```bash
docker run --rm -i -e TUSPARAMS=eyJ1cmwiOiJodHRwOi8vdGVybWludXNkYjo2MzYzIiwia2V5Ijoicm9vdCIsInVzZXIiOiJhZG1pbiIsImF1dGhvciI6ImphbmUuZG9lQGV4YW1wbGUuY29tIiwib3JnYW5pc2F0aW9uIjoiYWRtaW4iLCJkYiI6Im15ZGIifQo= hoijnet/tuscli:latest --mcp
```

On Linux, you can use `localhost` directly (optionally with `--net=host`).

## Dependencies and mentions

* Thanks to the great folks at [TerminusDB](https://terminusdb.com) for exciting open source technology
* Thanks to [debug](https://www.npmjs.com/package/debug) used for debug output
* Thanks to [commander](https://www.npmjs.com/package/commander) used for options parsing
