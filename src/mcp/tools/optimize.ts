import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerOptimizeTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "optimize_branch",
    `Optimize a branch by performing delta rollups. This compacts the internal storage layers, improving query performance after many writes.

Run this periodically on branches with heavy write activity, or after bulk data imports.

Example: Optimize the main branch
  branch: "main"

Example: Optimize a feature branch
  branch: "dev"`,
    {
      branch: z.string().describe('Branch name to optimize (e.g., "main"). Compacts storage layers for better query performance.'),
    },
    async ({ branch }) => {
      const client = createClient();
      const result = await commands.optimizeBranch(client, branch);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
