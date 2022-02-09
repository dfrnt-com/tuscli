# tuscli - Independent TerminusDB Javascript document cli

Interact with TerminusDB and DFRNT from the commandline to import/export documents and setup the schema. 

This open source tool is built to help changemakers leverage semantic knowledge graphs from the command line. We, [DFRNT](https://dfrnt.se?utm_source=github&utm_content=tuscli), believe in data mesh as a great bearer of structured organisational data. We leverage [TerminusDB](https://terminusdb.com) to build our product on. This tuscli tooling integrates [TerminusDB/TerminusX](https://terminusdb.com) data and complements the [DFRNT](https://dfrnt.se?utm_source=github&utm_content=tuscli) platform. 

Sign up to the [DFRNT waiting list](https://dfrnt.se?utm_source=github&utm_content=tuscli) to receive your invitation to our beta. We have slowly begun the onboarding now during early 2022.

## Requirements unless using a prepackaged form

* [NodeJS](https://nodejs.org/en/)

## Usage

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

To import an export, make sure that the coloring is removed from the json, and remove the TerminusDB schema preamble. Then it is possible to import the JSON array of documents with `--instance schema`and `--create` flags. Can be helpful to try in a separate branch as well.  

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
  -V, --version                                 output the version number
  -c, --create                                  create document from provided file
  -r, --read <document-id>                      read document-id (Type/id)
  -s, --schemaFrame <document-id>               get the schema frame for a type/subdoctype/enum
  -u, --update <document-id>                    update document
  -d, --delete <document-id>                    delete document
  -q, --query-documents <query-template-json>   list documents of type, example: {"type":"Person"}
  -e, --export-schema                           export/show instance schema JSON
  -p, --profile <json-file>                     JSON-formatted connection profile, or set env TUSPARAMS in base64 encoding
  -z, --dump-profile                            show the default or current connection profile, and how to set it
  -i, --instance <instance|schema>              specify instance or schema graph, default is instance
  -x, --system                                  connect to system database
  -o, --optimize <main>                         optimize and do delta rollups on a branch
  --createDatabase <database-id> <create-json>  create database/data product, default JSON: {"schema":true, "label":"","comment":""}
  --deleteDatabase <database-id>                delete database/data product
  --createBranch <branch-id> <true/false>       create branch, true for empty branch
  --deleteBranch <branch-id>                    delete branch
  --branches                                    pull list of branched in the data product
  -b, --branch <branch-id>                      select active branch
  --woql <WOQL>                                 Execute JS WOQL query (as an argument)
  -h, --help                                    display help for command
```

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

## Dependencies and mentions

* Thanks to the great folks at [TerminusDB](https://terminusdb.com) for exciting open source technology
* Thanks to [debug](https://www.npmjs.com/package/debug) used for debug output
* Thanks to [commander](https://www.npmjs.com/package/commander) used for options parsing
