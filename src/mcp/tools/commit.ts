import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerCommitTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  // @ts-ignore - MCP SDK type inference too deep for this signature
  server.tool(
    "get_commit_graph",
    "Retrieve the commit history for the data product",
    {
      count: z.number().optional().describe("Number of commits to retrieve (default: 10)"),
      branch: z.string().optional().describe("Branch to get commits for"),
    },
    async ({ count, branch }) => {
      const client = createClient({ branch });
      const result = await commands.getCommitGraph(client, count || 10, branch);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
