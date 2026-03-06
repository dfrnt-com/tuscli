import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerSchemaTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "export_schema",
    "Export the instance schema as JSON",
    {
      branch: z.string().optional().describe("Branch to export schema from"),
    },
    async ({ branch }) => {
      const client = createClient({ branch });
      const result = await commands.exportSchema(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_schema_frame",
    "Get the schema frame for a type, subdocument type, or enum",
    {
      type: z.string().describe("Type name to get the schema frame for"),
      branch: z.string().optional().describe("Branch to read from"),
    },
    async ({ type, branch }) => {
      const client = createClient({ branch });
      const result = await commands.getSchemaFrame(client, type);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
