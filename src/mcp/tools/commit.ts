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
    `Retrieve the commit history for the database. Each commit represents a change made to the data or schema, similar to Git commits.

Returns a list of commits with timestamps, authors, and messages. Use this to inspect recent changes or audit the history.

Example: Get the last 10 commits (default)
  (no parameters needed)

Example: Get the last 50 commits
  count: 50

Example: Get commits for a specific branch
  branch: "dev"
  count: 20`,
    {
      count: z.number().optional().describe("Number of recent commits to retrieve (default: 10). Increase for deeper history."),
      branch: z.string().optional().describe("Branch to get commit history for. Defaults to the main branch."),
    },
    async ({ count, branch }) => {
      const client = createClient({ branch });
      const result = await commands.getCommitGraph(client, count || 10, branch);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
