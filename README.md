# tuscli - Independent TerminusDB Javascript document client

Interact with TerminusDB from the commandline to import/export documents and setup the schema.

## Requirements

* [NodeJS](https://nodejs.org/en/)

## Usage

Interact with TerminusDB from the commandline to import/export documents and setup the schema.

```
$ export TUSPARAMS="$(echo '{"url":"http://localhost:6363","key":"password","user":"admin","organisation":"admin","db":"mydb"}' | base64 )"
$ npm install
$ node dist/tuscli.js
```

Install tuscli globally on your system

```
$ sudo npm install -g @hoijnet/tuscli
```

Build a docker image with tuscli as a binary in it

```
$ docker build --pull -t tuscli -f docker/Dockerfile .
$ docker run --rm -it tuscli tuscli --help
```


To build an executable tuscli file with embedded node.js in it:

```
$ npm run buildnexe
$ ./tuscli --help
```

## Examples

```
$ node dist/tuscli.js --export-schema
$ node dist/tuscli.js --query-document '{"type":"Person"}'
$ node dist/tuscli.js --read Person/johndoe
$ node dist/tuscli.js --delete Person/johndoe
$ node dist/tuscli.js --instance schema --create "`pwd`/schemaDocument.json"
$ node run buildnexe
$ ./tuscli --instance schema --update Person ./person.json
```

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
  -V, --version                                output the version number
  -c, --create                                 Create document from provided file
  -r, --read <document-id>                     Read document-id (Type/id)
  -s, --schemaFrame <document-id>              Get the schema frame for a type/subdoctype/enum
  -u, --update <document-id>                   Update document
  -d, --delete <document-id>                   Delete document
  -q, --query-documents <query-template-json>  List documents of type, example: {"type":"Person"}
  -e, --export-schema                          Export/show instance schema JSON
  -p, --profile <json-file>                    JSON-formatted connection profile, or set env
                                               TUSPARAMS in base64 encoding
  -z, --dump-profile                           Show the default or current connection profile, and
                                               how to set it
  -i, --instance <instance|schema>             Document instance, default is instance
  -x, --system                                 Connect to system database
  -h, --help                                   display help for command
```

## Contributing

* Clone the repo
* Share a pull request
* Open an issue

## What needs help

* Identify missing features and file issues
* Usability/naming of the cli user interface (early feedback)
* Usage examples (scripts with documents)
* Make it more robust, this is an early version!

## Dependencies and mentions

* Thanks to the great folks at [TerminusDB](https://terminusdb.com) for exciting open source technology
* Thanks to [debug](https://www.npmjs.com/package/debug) used for debug output
* Thanks to [commander](https://www.npmjs.com/package/commander) used for options parsing
