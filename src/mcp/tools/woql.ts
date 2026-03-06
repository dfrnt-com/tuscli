import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerWoqlTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "execute_woql",
    "Execute a WOQL query written in JavaScript WOQL syntax",
    {
      query: z.string().describe('WOQL query in JS syntax, e.g., WOQL.triple("v:X", "rdf:type", "@schema:Person")'),
      branch: z.string().optional().describe("Branch to query against"),
    },
    async ({ query, branch }) => {
      const client = createClient({ branch });
      const result = await commands.executeWoql(client, query);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "compile_woql",
    "Compile a WOQL query from JavaScript syntax to JSON AST without executing it",
    {
      query: z.string().describe("WOQL query in JS syntax to compile"),
    },
    async ({ query }) => {
      const result = commands.compileWoql(query);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
