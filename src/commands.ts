import { WOQL } from "terminusdb";
import fs from "node:fs";
import { GraphSelection, getFileJson, ITerminusConnectionObject, exampleConnObject } from "./connection";

export interface WoqlResource {
  filename: string;
  data: string | Blob | fs.ReadStream;
}

const parseWoql = (woql: string): any => {
  const normalizeWoql = (str: string): string => str.replace(/\\n/g, " ");
  return Function('"use strict";return ( function(WOQL, vars){return (' + normalizeWoql(woql) + ").json()});")()(WOQL);
};

// --- Profile ---

export interface DumpProfileResult {
  info: ITerminusConnectionObject;
  exampleEnvString: string;
}

export const dumpProfile = (connectionObject: ITerminusConnectionObject): DumpProfileResult => {
  const dumpInfo = { ...connectionObject };
  if (dumpInfo.key) {
    dumpInfo.key = "**** hidden ****";
  }
  if (dumpInfo.apikey) {
    dumpInfo.apikey = "**** hidden ****";
  }
  return {
    info: dumpInfo,
    exampleEnvString: '# export TUSPARAMS="$(echo ' + JSON.stringify(exampleConnObject) + ' |base64)" ',
  };
};

// --- Commit Graph ---

export const getCommitGraph = async (client: any, count: string | number, branch?: string): Promise<any[]> => {
  const defaultLength = 10;
  const commitBindings = (
    await client.query(
      WOQL.lib().commits(
        branch ?? undefined,
        typeof count === "string" ? count : defaultLength as any
      )
    )
  ).bindings;
  return commitBindings;
};

// --- Schema ---

export const exportSchema = async (client: any): Promise<any> => {
  return await client.getSchema();
};

export const getSchemaFrame = async (client: any, type: string): Promise<any> => {
  if (!type) throw new Error("No documentId to get the frame for provided");
  return await client.getSchemaFrame(type);
};

// --- Documents ---

export const createDocument = async (
  client: any,
  filePaths: string[],
  graphType: GraphSelection
): Promise<any[]> => {
  const results: any[] = [];
  for (const fileName of filePaths) {
    const obj = getFileJson(fileName);
    const result = await client.addDocument(obj, { graph_type: graphType });
    results.push(result);
  }
  return results;
};

export const createDocumentFromJson = async (
  client: any,
  jsonStrings: string[],
  graphType: GraphSelection
): Promise<any[]> => {
  const results: any[] = [];
  for (const obj of jsonStrings) {
    const result = await client.addDocument(obj, { graph_type: graphType });
    results.push(result);
  }
  return results;
};

export const updateDocument = async (
  client: any,
  documentId: string,
  filePaths: string[],
  graphType: GraphSelection
): Promise<any[]> => {
  const results: any[] = [];
  for (const fileName of filePaths) {
    const obj = getFileJson(fileName);
    const result = await client.updateDocument(obj, { id: documentId, graph_type: graphType });
    results.push(result);
  }
  return results;
};

export const queryDocuments = async (
  client: any,
  queryTemplateJson: string,
  graphType: GraphSelection
): Promise<any> => {
  if (!queryTemplateJson) throw new Error("No query template provided");
  return await client.queryDocument(JSON.parse(queryTemplateJson), { as_list: true, graph_type: graphType });
};

export const readDocument = async (
  client: any,
  documentId: string,
  graphType: GraphSelection
): Promise<any> => {
  if (!documentId) throw new Error("No documentId to read provided");
  return await client.getDocument({ id: documentId, graph_type: graphType });
};

export const deleteDocument = async (
  client: any,
  documentId: string,
  graphType: GraphSelection
): Promise<any> => {
  if (!documentId) throw new Error("Document to delete was not provided");
  return await client.deleteDocument({ id: [documentId], graph_type: graphType });
};

// --- Delete by type ---

export const deleteDocumentsOfType = async (
  client: any,
  type: string
): Promise<any> => {
  const comment = "tuscli";
  const parsedWoql = WOQL.and(
    WOQL.triple("v:DocumentId", "rdf:type", "@schema:" + type),
    WOQL.delete_document("v:DocumentId")
  );
  return await client.query(parsedWoql, comment);
};

export const deleteDocumentsIsaType = async (
  client: any,
  type: string
): Promise<any> => {
  const comment = "tuscli";
  const parsedWoql = WOQL.and(
    WOQL.isa("v:DocumentId", type),
    WOQL.delete_document("v:DocumentId")
  );
  return await client.query(parsedWoql, comment);
};

// --- Optimize ---

export const optimizeBranch = async (client: any, branch: string): Promise<any> => {
  if (!branch) throw new Error("What to optimize was not provided");
  return await client.optimizeBranch(branch);
};

// --- Database ---

export const createDatabase = async (
  client: any,
  dbName: string,
  createJsonString?: string
): Promise<any> => {
  if (!dbName) throw new Error("Database name to create was not provided");
  let createJson: any = {};
  if (createJsonString) {
    try {
      createJson = JSON.parse(createJsonString);
    } catch (e) {
      // fallback to empty
    }
  }
  if (createJson.schema === "false") {
    throw new Error('Error: schema element must be a boolean or undefined, and not "false". If undefined, it defaults to true.');
  }
  const databaseCreationOptions = {
    schema: typeof createJson.schema === "boolean" ? createJson.schema : true,
    label: typeof createJson.label === "string" ? createJson.label : "",
    comment: typeof createJson.comment === "string" ? createJson.comment : "",
  };
  return await client.createDatabase(dbName, databaseCreationOptions);
};

export const deleteDatabase = async (
  client: any,
  dbName: string,
  organisation: string
): Promise<any> => {
  if (!dbName) throw new Error("Database name to delete/kill was not provided");
  return await client.deleteDatabase(dbName, organisation);
};

// --- Branches ---

export const createBranch = async (
  client: any,
  branchName: string,
  empty: boolean = false
): Promise<any> => {
  return await client.branch(branchName, empty);
};

export const deleteBranch = async (client: any, branchName: string): Promise<any> => {
  return await client.deleteBranch(branchName);
};

export const getBranches = async (client: any): Promise<any> => {
  return await client.getBranches();
};

// --- WOQL ---

export const executeWoql = async (
  client: any,
  woqlString: string,
  namedResourceData: WoqlResource[] = []
): Promise<any> => {
  const comment = "tuscli";
  const parsedWoql = parseWoql(woqlString);
  const suppliedWoql = WOQL.json(parsedWoql);
  return await client.query(suppliedWoql, comment, false, { namedResourceData });
};

export const executeWoqlFile = async (
  client: any,
  filePath: string,
  namedResourceData: WoqlResource[] = []
): Promise<any> => {
  const comment = "tuscli";
  const woql = fs.readFileSync(filePath, "utf8");
  const parsedWoql = parseWoql(woql);
  const suppliedWoql = WOQL.json(parsedWoql);
  return await client.query(suppliedWoql, { comment, author: "tuscli" }, false, { namedResourceData });
};

export const compileWoql = (woqlString: string): any => {
  const parsedWoql = parseWoql(woqlString);
  return WOQL.json(parsedWoql);
};

export const compileWoqlFile = (filePath: string): any => {
  const woql = fs.readFileSync(filePath, "utf8");
  const parsedWoql = parseWoql(woql);
  return WOQL.json(parsedWoql);
};
