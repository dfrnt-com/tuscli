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
    `Create a new TerminusDB database (also called a data product). This must be called before any document or schema operations on a new database.

Typical workflow:
1. create_database — create the database
2. create_document with graph_type "schema" — define your schema classes
3. create_document — add instance documents conforming to the schema

Example: Create a database called "myproject"
  name: "myproject"
  label: "My Project"
  comment: "Project knowledge graph"

Example: Create a database with no schema graph
  name: "scratch"
  schema: false`,
    {
      name: z.string().describe("Database name/identifier (e.g., 'myproject'). Must be a valid identifier without spaces."),
      label: z.string().optional().describe("Human-readable display label for the database. Defaults to the name if not provided."),
      comment: z.string().optional().describe("Description or comment about the database purpose."),
      schema: z.boolean().optional().describe("Whether to create with a schema graph (default: true). Set to false for schema-free databases."),
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
    `Permanently delete a TerminusDB database and all its data, branches, and history. This action cannot be undone.

Example: Delete a database called "scratch"
  name: "scratch"`,
    {
      name: z.string().describe("Database name/identifier to delete (e.g., 'scratch'). The database and all its contents will be permanently removed."),
    },
    async ({ name }) => {
      const client = createClient();
      const result = await commands.deleteDatabase(client, name, connectionObject.organisation);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
