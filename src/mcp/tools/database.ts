import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ITerminusConnectionObject } from "../../connection";
import * as commands from "../../commands";

export function registerDatabaseTools(
  server: McpServer,
  createClient: (overrides?: any) => any,
  connectionObject: ITerminusConnectionObject
) {
  // @ts-ignore - MCP SDK type inference too deep for this signature
  server.tool(
    "create_database",
    "Create a new TerminusDB database/data product",
    {
      name: z.string().describe("Database name to create"),
      label: z.string().optional().describe("Human-readable label for the database"),
      comment: z.string().optional().describe("Description/comment for the database"),
      schema: z.boolean().optional().describe("Whether to create with schema graph (default: true)"),
    },
    async ({ name, label, comment, schema }) => {
      const client = createClient();
      const createJson = JSON.stringify({
        schema: schema !== undefined ? schema : true,
        label: label || name,
        comment: comment || "",
      });
      const result = await commands.createDatabase(client, name, createJson);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_database",
    "Delete a TerminusDB database/data product",
    {
      name: z.string().describe("Database name to delete"),
    },
    async ({ name }) => {
      const client = createClient();
      const result = await commands.deleteDatabase(client, name, connectionObject.organisation);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
