#!/usr/bin/env node
import { Command } from "commander";
import colorize from "json-colorizer";
import Debug from "debug";
import fs from "node:fs";
import {
  findConnectionConfiguration,
  connectClient,
  configureClient,
  selectGraph,
  exampleConnObject,
} from "./connection";
import {
  WoqlResource,
  dumpProfile,
  getCommitGraph,
  exportSchema,
  getSchemaFrame,
  createDocument,
  createDocumentFromJson,
  updateDocument,
  queryDocuments,
  readDocument,
  deleteDocument,
  deleteDocumentsOfType,
  deleteDocumentsIsaType,
  optimizeBranch,
  createDatabase,
  deleteDatabase,
  createBranch,
  deleteBranch,
  getBranches,
  executeWoql,
  executeWoqlFile,
  compileWoql,
  compileWoqlFile,
} from "./commands";

const program = new Command();
const collect = (value: string, previous: Array<string>) => previous.concat([value]);

program
  .version("0.2.5")
  .description("TerminusDB Javascript cli: tuscli [options] <fileName(s)>")
  .option("-c, --create", "create document from provided file")
  .option("--createFromJson", "create document from supplied JSON, like '{\"@id\":\"Entity/1\", \"@type\":\"Entity\"}'")
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
    "--createDatabase <dataproduct-id> <create-json>",
    'create data product, default JSON: {"schema":true, "label": "", "comment":""}'
  )
  .option("--deleteDatabase <dataproduct-id>", "delete database/data product")
  .option("--deleteDocumentsOfType <type>", "delete all documents of a type")
  .option("--deleteDocumentsIsaType <type>", "delete documents that are is-a type")
  .option("--dataProduct <dataproduct-id>", "override dataproduct to use")
  .option("--createBranch <branch-id> <true/false>", "create branch, true for empty branch")
  .option("--deleteBranch <branch-id>", "delete branch")
  .option("--branches", "pull list of branches in the data product")
  .option("--nocolor", "disable the colorize filter of output")
  .option("--quiet", "disable diagnostic outputs")
  .option("-x, --system", "connect to system database")
  .option("-y, --commitGraph <count>", "get the 10 last commits, supply an argument for more")
  .option("-i, --instance <instance|schema>", "document instance, default is instance")
  .option("-b, --branch <branch-id>", "use/select active branch")
  .option("-t, --commit <commit-id>", "use/select specific commit")
  .option("--woql <WOQL>", "Execute JS WOQL query (as an argument)")
  .option("--compileWoql <WOQL>", "Compile JS WOQL (as an argument) into JSON WOQL")
  .option("--woqlResource <file>", "named file resource(s) to attach to WOQL query (such as csv)", collect, [])
  .option("--woqlFile <example.woql.js>", "Execute JS WOQL (from a file)")
  .option("--woqlCompile <example.woql.js>", "Compile JS WOQL into JSON WOQL (from a file)")
  .option("--mcp", "Launch as an MCP (Model Context Protocol) server over stdio")
  .parse(process.argv);

const options = program.opts();
const debug = Debug("Zebra CLI");

if (options.mcp) {
  // Launch MCP server — dynamic import to avoid loading MCP deps for normal CLI usage
  require("./mcp/server");
} else {
  // Normal CLI mode
  if (Object.keys(options).length === 0) {
    program.help();
  }
  let showOutput = true;

  const connectionObject = findConnectionConfiguration(options.jsonFile, "TUSPARAMS");

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
    const profile = dumpProfile(connectionObject);
    console.warn("To set the environment variable in bash, use TUSREMOTE to remote services:");
    console.warn(profile.exampleEnvString);
    console.log("To debug, export DEBUG='*'");
    console.log("");
    console.warn("Current profile (except for keys):");
    consoleDumpJson(profile.info);
    process.exit(0);
  }

  const namedResourceData: Array<WoqlResource> = [];

  const cli = async () => {
    debug("Options: ", options);
    debug("Remaining arguments: ", program.args);
    const client = connectClient(connectionObject);

    configureClient(client, connectionObject, {
      dataProduct: options.dataProduct,
      system: options.system,
      branch: options.branch,
      commit: options.commit,
    });

    const database = selectGraph(options.instance);
    if (options.quiet) {
      showOutput = false;
    }

    if (options.woqlResource) {
      for (const filename of options.woqlResource) {
        if (typeof filename !== "string") { continue; }
        namedResourceData.push({
          filename,
          data: fs.createReadStream(filename),
        });
      }
    }

    if (options.commitGraph) {
      consoleDumpJson(await getCommitGraph(client, options.commitGraph, options.branch));
    }

    if (options.exportSchema) {
      consoleDumpJson(await exportSchema(client));
    }

    if (options.create) {
      debug(await createDocument(client, program.args, database));
    }

    if (options.createFromJson) {
      debug(await createDocumentFromJson(client, program.args, database));
    }

    if (options.update) {
      debug(await updateDocument(client, options.update, program.args, database));
    }

    if (typeof options.queryDocuments === "string") {
      consoleDumpJson(await queryDocuments(client, options.queryDocuments, database));
    }

    if (typeof options.read === "string") {
      consoleDumpJson(await readDocument(client, options.read, database));
    }

    if (typeof options.schemaFrame === "string") {
      consoleDumpJson(await getSchemaFrame(client, options.schemaFrame));
    }

    if (typeof options.delete === "string") {
      consoleDumpJson(await deleteDocument(client, options.delete, database));
    }

    if (typeof options.optimize === "string") {
      consoleDumpJson(await optimizeBranch(client, options.optimize));
    }

    if (typeof options.createDatabase === "string") {
      const createJsonFromFileNameParameter = program.args[0]; // Not supported by commander
      const result = await createDatabase(client, options.createDatabase, createJsonFromFileNameParameter);
      showOutput && consoleDumpJson(result);
    }

    if (typeof options.deleteDatabase === "string") {
      const result = await deleteDatabase(client, options.deleteDatabase, connectionObject.organisation);
      showOutput && consoleDumpJson(result);
    }

    if (typeof options.createBranch === "string") {
      const createEmptyBranch = program.args[0];
      const result = await createBranch(client, options.createBranch, createEmptyBranch === "true");
      showOutput && consoleDumpJson(result);
    }

    if (typeof options.deleteBranch === "string") {
      const result = await deleteBranch(client, options.deleteBranch);
      showOutput && consoleDumpJson(result);
    }

    if (options.branches) {
      consoleDumpJson(await getBranches(client));
    }

    if (typeof options.deleteDocumentsOfType === "string") {
      const result = await deleteDocumentsOfType(client, options.deleteDocumentsOfType);
      showOutput && consoleDumpJson(result);
    }

    if (typeof options.deleteDocumentsIsaType === "string") {
      const result = await deleteDocumentsIsaType(client, options.deleteDocumentsIsaType);
      showOutput && consoleDumpJson(result);
    }

    if (typeof options.woql === "string") {
      const result = await executeWoql(client, options.woql, namedResourceData);
      showOutput && consoleDumpJson(result);
    }

    if (typeof options.woqlFile === "string") {
      const result = await executeWoqlFile(client, options.woqlFile, namedResourceData);
      showOutput && consoleDumpJson(result);
    }

    if (typeof options.woqlCompile === "string") {
      consoleDumpJson(compileWoqlFile(options.woqlCompile));
    }

    if (typeof options.compileWoql === "string") {
      consoleDumpJson(compileWoql(options.compileWoql));
    }
  };

  cli();
}
