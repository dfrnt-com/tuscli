#!/usr/bin/env node
import TerminusClient, { WOQL } from "@terminusdb/terminusdb-client";
import { Command } from "commander";
import colorize from "json-colorizer";
import Debug from "debug";
import fs from "fs";

const program = new Command();

program
  .version("0.1.9")
  .description("TerminusDB Javascript cli: tuscli [options] <fileName(s)>")
  .option("-c, --create", "create document from provided file")
  .option("-r, --read <document-id>", "read document-id (Type/id)")
  .option("-s, --schemaFrame <document-id>", "get the schema frame for a type/subdoctype/enum")
  .option("-u, --update <document-id>", "update document")
  .option("-d, --delete <document-id>", "delete document")
  .option("-q, --query-documents <query-template-json>", 'list documents of type, example: {"type":"Person"}')
  .option("-e, --export-schema", "export/show instance schema JSON")
  .option("-p, --profile <json-file>", "JSON-formatted connection profile, or set env TUSPARAMS in base64 encoding")
  .option("-z, --dump-profile", "show the default or current connection profile, and how to set it")
  .option("-o, --optimize <main>", "optimize and do delta rollups on a branch")
  .option(
    "--createDatabase <database-id> <create-json>",
    'create database/data product, default JSON: {"schema":true, "label": "", "comment":""}'
  )
  .option("--deleteDatabase <database-id>", "delete database/data product")
  .option("--createBranch <branch-id> <true/false>", "create branch, true for empty branch")
  .option("--deleteBranch <branch-id>", "delete branch")
  .option("--branches", "pull list of branches in the data product")
  .option("--nocolor", "disable the colorize filter of output")
  .option("-x, --system", "connect to system database")
  .option("-y, --commitGraph <count>", "get the 10 last commits, supply an argument for more")
  .option("-i, --instance <instance|schema>", "document instance, default is instance")
  .option("-b, --branch <branch-id>", "use/select active branch")
  .option("-t, --commit <commit-id>", "use/select specific commit")
  .option("--woql <WOQL>", "Execute JS WOQL query (as an argument)")
  .option("--compileWoql <WOQL>", "Compile JS WOQL (as an argument) into JSON WOQL")
  .parse(process.argv);

enum DatabaseSelection {
  SCHEMA = "schema",
  INSTANCE = "instance",
}
enum RepoType {
  local = "local",
  remote = "remote",
}

const options = program.opts();
const debug = Debug("Zebra CLI");
if (Object.keys(options).length === 0) {
  program.help();
}

interface ITerminusConnectionObject {
  url: string;
  key?: string;
  apikey?: string;
  user: string;
  organisation: string;
  db: string;
  repo?: RepoType | string;
  branch?: string;
  ref?: string;
  default_branch_id?: string;
}

const btoa = (b: string) => Buffer.from(b, "base64").toString("binary");
const getFileJson = (path: string) => {
  try {
    if (!fs.existsSync(path)) {
      throw new Error("File does not exist");
    }
    try {
      return JSON.parse(fs.readFileSync(path).toString());
    } catch (e) {
      throw new Error("Could not parse the file correctly, likely bad JSON");
    }
  } catch (e) {
    console.error("Could handle input file correctly: ", path);
    console.log(e);
    process.exit(1);
  }
};

const findConnectionConfiguration = (file: string, envName: string) => {
  const envParameters = process.env[envName];

  if (file) {
    debug("Provided configuration information from file: " + file);
    return <ITerminusConnectionObject>getFileJson(file);
  } else if (envParameters) {
    try {
      debug("Provided configuration infomation from TUSPARAMS: " + btoa(envParameters));
      return <ITerminusConnectionObject>JSON.parse(btoa(envParameters));
    } catch (e) {
      console.error(envName + " environment variable not with proper base64 encoded JSON string");
    }
  }
  debug("No provided connection information");
  return <ITerminusConnectionObject>{};
};

const exampleConnObject = JSON.stringify({
  url: "http://localhost:6363",
  key: "password",
  user: "admin",
  organisation: "admin",
  db: "mydb",
});

const connectionObject = findConnectionConfiguration(options.jsonFile, "TUSPARAMS");
const remoteObject = findConnectionConfiguration(options.jsonFile, "TUSREMOTE");

debug(exampleConnObject);

const consoleDumpJson = (obj: object) => {
  const json = JSON.stringify(obj, null, 2);
  if (options.nocolor) {
    console.log(json);
  } else {
    console.log(colorize(json, { pretty: true }));
  }
};

if (options.dumpProfile) {
  const dumpInfo = Object.assign({}, connectionObject);
  if (dumpInfo.key) {
    dumpInfo.key = "**** hidden ****";
  }
  if (dumpInfo.apikey) {
    dumpInfo.apikey = "**** hidden ****";
  }
  console.warn("To set the environment variable in bash, use TUSREMOTE to remote services:");
  console.warn('# export TUSPARAMS="$(echo ' + JSON.stringify(exampleConnObject) + ' |base64)" ');
  console.log("To debug, export DEBUG='*'");
  console.log("");
  console.warn("Current profile (except for keys):");
  consoleDumpJson(dumpInfo);
  process.exit(0);
}

const connectClient = (connInfo: ITerminusConnectionObject): any => {
  if ("key" in connInfo) {
    return new TerminusClient.WOQLClient(connInfo.url, {
      db: connInfo.db,
      key: connInfo.key,
      user: connInfo.user,
      organisation: connInfo.organisation,
    });
  } else {
    return new TerminusClient.WOQLClient(connInfo.url, {
      user: connInfo.user,
      organisation: connInfo.organisation,
    });
  }
};

export const cli = async () => {
  debug("Options: ", options);
  debug("Remaining arguments: ", program.args);
  const client = connectClient(connectionObject);

  // Make local and remote authentication
  // Convert to new connection object for the TUSPARAMS
  // client.remoteAuth({"key":"randomkey","type":"jwt"})

  if ("apikey" in connectionObject) {
    client.setApiKey(connectionObject.apikey);
  }
  client.db(connectionObject.db);
  client.organization(connectionObject.organisation);

  const selectDatabase = (selectedDatabase: DatabaseSelection) => {
    switch (selectedDatabase) {
      case "schema":
        return selectedDatabase;
      case "instance":
        return selectedDatabase;
      default:
        return DatabaseSelection.INSTANCE;
    }
  };

  let database: DatabaseSelection = selectDatabase(options.instance);
  if (options.system) {
    client.setSystemDb();
  }

  if (options.branch) {
    client.checkout(options.branch);
  }

  if (options.commit) {
    client.ref(options.commit);
  }

  if (options.commitGraph) {
    const defaultLength = 10;
    const commitBindings = (
      await client.query(
        WOQL.lib().commits(
          options.branch ?? undefined,
          typeof options.commitGraph === "string" ? options.commitGraph : defaultLength
        )
      )
    ).bindings;
    consoleDumpJson(commitBindings);
  }

  if (options.exportSchema) {
    consoleDumpJson(await client.getSchema());
  }

  if (options.create) {
    debug(
      program.args
        .map((fileName) => getFileJson(fileName))
        .map(async (obj) => {
          await client.addDocument(obj, { graph_type: database });
        })
    );
  }

  if (options.update) {
    debug(
      program.args
        .map((fileName) => getFileJson(fileName))
        .map(async (obj) => {
          await client.updateDocument(obj, { id: options.update, graph_type: database });
        })
    );
  }

  if (typeof options.queryDocuments === "string") {
    if (!options.queryDocuments) throw new Error("No query template provided");
    consoleDumpJson(await client.queryDocument(JSON.parse(options.queryDocuments), { as_list: true, graph_type: database }));
  }

  if (typeof options.read === "string") {
    if (!options.read) throw new Error("No documentId to read provided");
    consoleDumpJson(await client.getDocument({ id: options.read, graph_type: database }));
  }

  if (typeof options.schemaFrame === "string") {
    if (!options.schemaFrame) throw new Error("No documentId to get the frame for provided");
    consoleDumpJson(await client.getSchemaFrame(options.schemaFrame));
  }

  if (typeof options.delete === "string") {
    if (!options.delete) throw new Error("Document to delete was not provided");
    consoleDumpJson(await client.deleteDocument({ id: [options.delete], graph_type: database }));
  }

  if (typeof options.optimize === "string") {
    if (!options.optimize) throw new Error("What to optimize was not provided");
    consoleDumpJson(await client.optimizeBranch(options.optimize));
  }

  if (typeof options.createDatabase === "string") {
    const createJsonFromFileNameParameter = program.args[0]; // Not supported by commander
    if (!options.createDatabase) throw new Error("Database name to create was not provided");
    let createJson = await (async () => JSON.parse(createJsonFromFileNameParameter))()
      .then((res) => res)
      .catch(() => ({}));
    if (createJson.schema === "false") {
      throw new Error('Error: schema element must be a boolean or undefined, and not "false". If undefined, it defaults to true.');
    }
    const databaseCreationOptions = {
      schema: typeof createJson.schema === "boolean" ? createJson.schema : true,
      label: typeof createJson.label === "string" ? createJson.label : "",
      comment: typeof createJson.comment === "string" ? createJson.comment : "",
    };
    consoleDumpJson(await client.createDatabase(options.createDatabase, databaseCreationOptions));
  }

  if (typeof options.deleteDatabase === "string") {
    if (!options.deleteDatabase) throw new Error("Database name to delete/kill was not provided");
    consoleDumpJson(await client.deleteDatabase(options.deleteDatabase, connectionObject.organisation));
  }

  if (typeof options.createBranch === "string") {
    const createEmptyBranch = program.args[0];
    if (createEmptyBranch === "true") {
      consoleDumpJson(await client.branch(options.createBranch, true));
    } else {
      consoleDumpJson(await client.branch(options.createBranch, false));
    }
  }

  if (typeof options.deleteBranch === "string") {
    consoleDumpJson(await client.deleteBranch(options.deleteBranch));
  }

  if (options.branches) {
    consoleDumpJson(await client.getBranches());
  }

  
  const parseWoql = (woql: string) => {
    const normalizeWoql = (str: string): string => str.replace(/\\n/g, " ");
    return Function('"use strict";return ( function(WOQL){return (' + normalizeWoql(woql) + ").json()});")()(WOQL);
  };

  if (typeof options.woql === "string") {
    const comment = typeof process.argv[0] === "string" ? process.argv[0] : "tuscli";
    const parsedWoql = parseWoql(options.woql);
    const suppliedWoql = WOQL.json(parsedWoql);
    consoleDumpJson(await client.query(suppliedWoql, comment));
  }

  if (typeof options.compileWoql === "string") {
    const parsedWoql = parseWoql(options.compileWoql);
    const suppliedWoql = WOQL.json(parsedWoql);
    consoleDumpJson(suppliedWoql);
  }
};

cli();
