#!/usr/bin/env node
import TerminusClient from '@terminusdb/terminusdb-client';
import { Command } from 'commander';
import Debug from "debug";
import fs from 'fs';

const program = new Command();

program
  .version('0.0.1')
  .description("TerminusDB Javascript cli: tuscli [options] <fileName(s)>")
  .option('-c, --create', 'Create document from provided file')
  .option('-r, --read <document-id>', 'Read document-id (Type/id)')
  .option('-s, --schemaFrame <document-id>', 'Get the schema frame for a type/subdoctype/enum')
  //.option('-u, --update <document-id>', 'Update document')
  .option('-d, --delete <document-id>', 'Delete document')
  .option('-q, --query-documents <query-template-json>', 'List documents of type, example: {"type":"Person"}')
  .option('-e, --export-schema', 'Export/show instance schema JSON')
  .option('-p, --profile <json-file>', 'JSON-formatted connection profile, or set env TUSPARAMS in base64 encoding')
  .option('-z, --dump-profile', 'Show the default or current connection profile, and how to set it')
  .option('-i, --instance <instance|schema>', 'Document instance, default is instance')
  .option('-x, --system', 'Connect to system database')
  .parse(process.argv);

enum DatabaseSelection { SCHEMA = "schema", INSTANCE = "instance" }
enum RepoType { local = "local", remote = "remote" }

const options = program.opts();
const debug = Debug("Zebra CLI");
if (Object.keys(options).length === 0) {
  program.help();
}

interface ITerminusConnectionObject {
  url: string,
  key?: string,
  apikey?: string,
  user: string,
  organisation: string,
  db: string,
  repo?: RepoType | string,
  branch?: string,
  ref?: string,
  default_branch_id?: string,
}

const btoa = (b: string) => Buffer.from(b, 'base64').toString('binary')
const getFileJson = (path: string) => {
  try {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(path).toString());
    } else {
      throw new Error("Could not read file");
    }
  } catch (e) {
    console.log("Could not read file: ", path);
    process.exit(1);
  }
}
const findConnectionConfiguration = (file: string) => {
  if (file) {
    debug("Provided configuration information from file: " + file);
    return <ITerminusConnectionObject>getFileJson(file);
  } else if (process.env.TUSPARAMS) {
    try {
      debug("Provided configuration infomation from TUSPARAMS: " + btoa(process.env.TUSPARAMS));
      return <ITerminusConnectionObject>JSON.parse(btoa(process.env.TUSPARAMS ?? ""));
    } catch (e) {
      console.error("TUSPARAMS environment variable not proper base64 encoded JSON string");
    }
  }
  debug("No provided connection information");
  return <ITerminusConnectionObject>{
  }
}

const exampleConnObject = JSON.stringify({
  url: "http://localhost:6363",
  key: "password",
  user: "admin",
  organisation: "admin",
  db: "mydb"
})

const connectionObject = findConnectionConfiguration(options.jsonFile)

debug(exampleConnObject);

if (options.dumpProfile) {
  const dumpInfo = Object.assign({}, connectionObject);
  if (dumpInfo.key) { dumpInfo.key = "**** hidden ****"; }
  if (dumpInfo.apikey) { dumpInfo.apikey = "**** hidden ****"; }
  console.warn("To set the environment variable in bash:");
  console.warn('# export TUSPARAMS="$(echo ' + JSON.stringify(exampleConnObject) + ' |base64)" ');
  console.log("To debug, export DEBUG='*'");
  console.log("");
  console.warn("Current profile (except for keys):");
  console.log(dumpInfo);
  process.exit(0);
}

export const cli = async () => {
  debug('Options: ', options);
  debug('Remaining arguments: ', program.args);
  const connectClient = (connInfo: ITerminusConnectionObject): any => {
    if ("key" in connInfo) {
      return new TerminusClient.WOQLClient(connInfo.url, { db: connInfo.db, key: connInfo.key, user: connInfo.user, organisation: connInfo.organisation, });
    } else {
      return new TerminusClient.WOQLClient(connInfo.url, { db: connInfo.db, user: connInfo.user, organisation: connInfo.organisation, });
    }
  }
  const client = connectClient(connectionObject);

  if ("apikey" in connectionObject) {
    client.setApiKey(connectionObject.apikey);
  }
  await client.connect();

  const selectDatabase = (selectedDatabase: DatabaseSelection) => {
    switch (selectedDatabase) {
      case "schema":
        return selectedDatabase;
      case "instance":
        return selectedDatabase;
      default:
        return DatabaseSelection.INSTANCE;
    }
  }

  let database: DatabaseSelection = selectDatabase(options.instance);
  if (options.system) {
    client.setSystemDb();
  }

  if (options.exportSchema) {
    console.log(await client.getSchema());
  }

  if (options.create) {
    debug(
      program.args
        .map(fileName => getFileJson(fileName))
        .map(async obj => { await client.addDocument(obj, { graph_type: database }) }
        )
    )
  }

  if (options.queryDocuments) {
    if (!options.queryDocuments) throw new Error("No query template provided")
    console.log(await client.queryDocument(JSON.parse(options.queryDocuments), { "as_list": true, graph_type: database }));
  }

  if (options.read) {
    if (!options.read) throw new Error("No documentId to read provided")
    console.log(await client.getDocument({ id: options.read, graph_type: database }));
  }

  if (options.schemaFrame) {
    if (!options.schemaFrame) throw new Error("No documentId to get the frame for provided")
    console.log(await client.getSchemaFrame(options.schemaFrame));
  }

  if (options.delete) {
    if (!options.delete) throw new Error("Document to delete was not provided")
    console.log(await client.deleteDocument({ id: [options.delete], graph_type: database }));
  }
}

cli();
