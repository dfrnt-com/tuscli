import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerOptimizeTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "optimize_branch",
    "Optimize and perform delta rollups on a branch",
    {
      branch: z.string().describe("Branch name to optimize (e.g., main)"),
    },
    async ({ branch }) => {
      const client = createClient();
      const result = await commands.optimizeBranch(client, branch);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
