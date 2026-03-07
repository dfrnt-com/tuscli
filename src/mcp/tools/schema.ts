import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerSchemaTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "export_schema",
    `Export the full schema of the database as a JSON array. Returns all class definitions, enums, and type hierarchies.

Use this to inspect the current data model before creating or updating documents. The result is a JSON array of schema class objects.

Example: Export the schema of the current database
  (no parameters needed)

Example: Export schema from a specific branch
  branch: "dev"

The response will be a JSON array like:
[
  {"@id":"Person","@type":"Class","name":"xsd:string","age":"xsd:integer"},
  {"@id":"Color","@type":"Enum","@value":["red","green","blue"]}
]`,
    {
      branch: z.string().optional().describe("Branch to export schema from. Defaults to the main branch."),
    },
    async ({ branch }) => {
      const client = createClient({ branch });
      const result = await commands.exportSchema(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_schema_frame",
    `Get the detailed schema frame for a specific type, subdocument, or enum. Returns the full type definition including all properties, their types, and constraints.

Use this to understand the shape of a type before creating or updating documents of that type.

Example: Get the frame for Person
  type: "Person"

Example: Get an enum's allowed values
  type: "Color"

The response includes property names, their XSD types (xsd:string, xsd:integer, xsd:dateTime, etc.), and cardinality (Optional, Set, List, Array).`,
    {
      type: z.string().describe('Type/class name to inspect (e.g., "Person", "Color"). Returns the full property definitions for the type.'),
      branch: z.string().optional().describe("Branch to read from. Defaults to the main branch."),
    },
    async ({ type, branch }) => {
      const client = createClient({ branch });
      const result = await commands.getSchemaFrame(client, type);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
