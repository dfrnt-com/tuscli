#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  findConnectionConfiguration,
  connectClient,
  configureClient,
  ITerminusConnectionObject,
} from "../connection";
import { registerDatabaseTools } from "./tools/database";
import { registerDocumentTools } from "./tools/documents";
import { registerSchemaTools } from "./tools/schema";
import { registerBranchTools } from "./tools/branches";
import { registerWoqlTools } from "./tools/woql";
import { registerCommitTools } from "./tools/commit";
import { registerOptimizeTools } from "./tools/optimize";
import { registerProfileTools } from "./tools/profile";

const connectionObject: ITerminusConnectionObject = findConnectionConfiguration("", "TUSPARAMS");

const createConfiguredClient = (overrides?: { dataProduct?: string; branch?: string; commit?: string; system?: boolean }) => {
  const client = connectClient(connectionObject);
  configureClient(client, connectionObject, overrides || {});
  return client;
};

const server = new McpServer({
  name: "tuscli",
  version: "0.2.5",
});

registerDatabaseTools(server, createConfiguredClient, connectionObject);
registerDocumentTools(server, createConfiguredClient);
registerSchemaTools(server, createConfiguredClient);
registerBranchTools(server, createConfiguredClient);
registerWoqlTools(server, createConfiguredClient);
registerCommitTools(server, createConfiguredClient);
registerOptimizeTools(server, createConfiguredClient);
registerProfileTools(server, connectionObject);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP server error:", error);
  process.exit(1);
});
